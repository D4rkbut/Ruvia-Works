const { onValueCreated } = require("firebase-functions/v2/database");
const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");

initializeApp();
const db = getDatabase();

function arr(v){
  if(Array.isArray(v)) return v.filter(Boolean);
  if(!v || typeof v !== "object") return [];
  return Object.entries(v).map(([id,x])=>x&&typeof x==="object"?{id:x.id||id,...x}:null).filter(Boolean);
}
function tmin(t){if(!t||!/^\d{2}:\d{2}$/.test(t))return 0;const [h,m]=t.split(":").map(Number);return h*60+m;}
function mt(m){m=Math.max(0,Math.min(1439,Math.round(m)));return `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;}
function overlap(a,b,c,d){return tmin(a)<tmin(d)&&tmin(c)<tmin(b);}
function endOf(a){return a.endTime||mt(tmin(a.startTime)+(Number(a.durationMin)||0));}
function conflictReason(scheduling,draft){
  const resources=arr(scheduling.resources),appointments=arr(scheduling.appointments).filter(a=>!["cancelled","no_show"].includes(a.status)),blocks=arr(scheduling.blocks);
  const selected=(draft.resourceIds||[]).filter(Boolean),start=draft.startTime,end=draft.endTime,party=Math.max(1,Number(draft.partySize)||1);
  for(const rid of selected){
    const r=resources.find(x=>x.id===rid);
    if(!r||r.active===false) return "Recurso indisponível.";
    const day=String(new Date(draft.date+"T12:00:00").getDay());
    const hasRule=r.availability&&Object.prototype.hasOwnProperty.call(r.availability,day);
    const slots=hasRule?(Array.isArray(r.availability[day])?r.availability[day]:[]):[];
    if(hasRule&&slots.length===0)return `${r.name} não está disponível neste dia.`;
    if(hasRule&&!slots.some(s=>tmin(start)>=tmin(s.start)&&tmin(end)<=tmin(s.end)))return `${r.name} não está disponível nesse horário.`;
    if(Number(r.capacity)>0&&party>Number(r.capacity))return `${r.name} não comporta essa quantidade.`;
    const block=blocks.find(b=>b.resourceId===rid&&b.date===draft.date&&overlap(start,end,b.startTime||"00:00",b.endTime||"23:59"));
    if(block)return `${r.name} está bloqueado nesse horário.`;
    const same=appointments.filter(a=>a.date===draft.date&&(a.resourceIds||[]).includes(rid)&&overlap(start,end,a.startTime,endOf(a)));
    if(r.bookingMode==="capacity"){
      const used=same.reduce((n,a)=>n+Math.max(1,Number(a.partySize)||1),0);
      if(used+party>Math.max(1,Number(r.capacity)||1))return `${r.name} não tem capacidade suficiente.`;
    }else if(same.length)return `${r.name} já está ocupado nesse horário.`;
  }
  return null;
}

exports.autoConfirmPublicBooking = onValueCreated("/publicRequests/{siteId}/{requestId}", async (event) => {
  const req=event.data.val()||{};
  if(req.type!=="booking_request"||req.status!=="pending")return;
  const {siteId,requestId}=event.params;
  const siteSnap=await db.ref(`sites/${siteId}`).get();
  if(!siteSnap.exists())return;
  const site=siteSnap.val()||{};
  if(site.settings?.publicBooking?.autoConfirm!==true)return;
  const businessId=site.profile?.linkedBusinessId;
  if(!businessId){await event.data.ref.update({status:"needs_review",reviewReason:"Site sem Business conectado",updatedAt:Date.now()});return;}
  const businessSnap=await db.ref(`businesses/${businessId}`).get();
  if(!businessSnap.exists()){await event.data.ref.update({status:"needs_review",reviewReason:"Business indisponível",updatedAt:Date.now()});return;}
  const business=businessSnap.val()||{};
  const linkedByUid=site.profile?.linkedByUid;
  if(!linkedByUid || business.members?.[linkedByUid]?.status!=="active" || site.members?.[linkedByUid]?.status!=="active"){await event.data.ref.update({status:"needs_review",reviewReason:"Conexão com o Business não está autorizada",updatedAt:Date.now()});return;}
  const services=arr(business.scheduling?.services);
  const service=req.serviceId?services.find(x=>x.id===req.serviceId):null;
  if(req.serviceId&&!service){await event.data.ref.update({status:"needs_review",reviewReason:"Serviço não encontrado",updatedAt:Date.now()});return;}
  if(!req.preferredDate||!req.startTime){await event.data.ref.update({status:"needs_review",reviewReason:"Data ou horário ausente",updatedAt:Date.now()});return;}
  const requestedResources=Array.isArray(req.resourceIds)?req.resourceIds.filter(Boolean):[];
  if(service?.resourceRequired&&!requestedResources.length){await event.data.ref.update({status:"needs_review",reviewReason:"Serviço exige recurso/profissional",updatedAt:Date.now()});return;}
  if(service?.compatibleResourceIds?.length&&requestedResources.some(id=>!service.compatibleResourceIds.includes(id))){await event.data.ref.update({status:"needs_review",reviewReason:"Recurso incompatível com o serviço",updatedAt:Date.now()});return;}
  const duration=Math.max(5,Number(req.durationMin)||Number(service?.durationMin)||60);
  const draft={clientId:null,clientName:req.clientName||"Cliente",contact:req.phone||"",serviceId:req.serviceId||null,serviceName:req.serviceName||service?.name||null,resourceIds:requestedResources,date:req.preferredDate,startTime:req.startTime,durationMin:duration,endTime:mt(tmin(req.startTime)+duration),partySize:Math.max(1,Number(req.partySize)||1),notes:req.notes||"",internalNotes:`Confirmação automática via ${site.profile?.name||"site"}`,sourceSiteId:siteId,sourceRequestId:requestId};
  const reason=conflictReason(business.scheduling||{},draft);
  if(reason){await event.data.ref.update({status:"needs_review",reviewReason:reason,updatedAt:Date.now()});return;}
  const appointmentRef=db.ref(`businesses/${businessId}/scheduling/appointments`).push();
  const historyRef=db.ref(`businesses/${businessId}/activity/history`).push();
  const now=Date.now();
  const updates={};
  updates[`businesses/${businessId}/scheduling/appointments/${appointmentRef.key}`]={id:appointmentRef.key,status:"confirmed",createdAt:now,updatedAt:now,entryMethod:"public_site_auto",...draft};
  updates[`businesses/${businessId}/activity/history/${historyRef.key}`]={id:historyRef.key,type:"agendamento_publico",date:new Date().toISOString().slice(0,10),createdAt:now,actorUid:"system",actorName:"Ruvia Public",description:`Solicitação pública confirmada automaticamente — ${draft.clientName} — ${draft.date} ${draft.startTime}`,refId:appointmentRef.key,clientId:null};
  updates[`publicRequests/${siteId}/${requestId}/status`]="accepted";
  updates[`publicRequests/${siteId}/${requestId}/appointmentId`]=appointmentRef.key;
  updates[`publicRequests/${siteId}/${requestId}/handledAt`]=now;
  updates[`publicRequests/${siteId}/${requestId}/autoConfirmed`]=true;
  await db.ref().update(updates);
});
