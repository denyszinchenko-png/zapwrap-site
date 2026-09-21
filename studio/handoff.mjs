import {parseSavedBuild,encodeConfig,ZONES,PANEL_LABELS} from './config.mjs';
import {productById,PREVIEW_DISCLAIMER} from './products.mjs';
import {localVehicleReview} from './vehicle-review.mjs';

export const DRAFT_KEY='zapwrap-inquiry-draft-v1';
export const QUOTE_NOTE='Final pricing is confirmed after reviewing your vehicle, paint condition and selected film.';
export function estimate(){return {status:'quote-required',label:'Quote required',currency:'USD',linearFeet:null,price:null,note:QUOTE_NOTE};}
export function buildLink(build,base,ids){
  const clean=parseSavedBuild(JSON.stringify(build),ids),url=new URL(base);
  if(!['https:','http:'].includes(url.protocol))throw new Error('Open the studio through its web address.');
  const review=localVehicleReview(url);url.search=review?'?review=first20':'';url.hash='build='+encodeConfig(clean);
  const local=/^(localhost|127\.|0\.0\.0\.0|\[::1\]|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname);
  return {url:url.href,local};
}
export function readBuildHash(hash,ids){
  if(!hash.startsWith('#build='))return null;
  if(hash.length>90000)throw new Error('This preview link is too large. Open a saved build file instead.');
  try{return parseSavedBuild(atob(hash.slice(7)),ids);}catch(error){throw new Error('This preview link cannot be restored. '+error.message);}
}
export function buildWarnings(raw,clean){
  const warnings=[];
  if(raw.product&&!clean.product)warnings.push('The saved film or render version is unavailable. A technical color approximation is shown; select a current film before requesting a quote.');
  return warnings;
}
export function createDraft(input,build,vehicles,base){
  const text=(key,max)=>{const v=typeof input[key]==='string'?input[key].trim():'';if(v.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v))throw new Error('Please shorten or correct the '+key+' field.');return v;};
  const name=text('name',80),contact=text('contact',160),comment=text('comment',1500);
  if(!name||!contact)throw new Error('Enter your name and an email address or phone number.');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)&&!(/^[+()\d\s.-]+$/.test(contact)&&contact.replace(/\D/g,'').length>=7))throw new Error('Enter a valid email address or phone number.');
  const intent=['quote','consultation','configuration'].includes(input.intent)?input.intent:'quote';
  const ids=vehicles.filter(v=>v.src).map(v=>v.id),config=parseSavedBuild(JSON.stringify(build),ids),vehicle=vehicles.find(v=>v.id===config.vehicle);
  if(!config.assetVersion||!config.camera)throw new Error('Wait for the vehicle to load before preparing your request.');
  const link=buildLink(config,base,ids),product=productById(config.product);
  return {version:1,status:'local-draft',createdAt:new Date().toISOString(),intent,name,contact,comment,configuration:config,
    vehicleLabel:`${vehicle.year} ${vehicle.make} ${vehicle.model}`,assetNote:vehicle.note||'Vehicle accuracy requires review.',
    filmLabel:product?`${product.brand} ${product.name}${product.manufacturerCode?' ('+product.manufacturerCode+')':''}`:`Technical color study: ${config.color} / ${config.finish}`,
    panelLabel:config.wrapTarget!=='full'?`${PANEL_LABELS[config.wrapTarget]||config.wrapTarget} exterior`:config.coverage==='extended'?'Exterior body panels; '+config.zones.map(z=>ZONES[z]).join('; '):'Exterior body panels',
    previewLink:link.local?null:link.url,localPreview:link.local,estimate:estimate(),disclaimer:PREVIEW_DISCLAIMER};
}
export function draftMessage(draft){
  return ['Zap Wrap '+({quote:'quote request',consultation:'consultation request',configuration:'configuration'}[draft.intent]),
    'Vehicle: '+draft.vehicleLabel,draft.assetNote,'Film: '+draft.filmLabel,'Panels: '+draft.panelLabel,
    'Name: '+draft.name,'Contact: '+draft.contact,draft.comment?'Notes: '+draft.comment:'',
    draft.previewLink?'Preview: '+draft.previewLink:'Preview is local. Please attach the saved build JSON and PNG to this conversation.',
    draft.estimate.label+'. '+QUOTE_NOTE,PREVIEW_DISCLAIMER].filter(Boolean).join('\n');
}
export function whatsappLink(draft){return 'https://wa.me/12394065533?text='+encodeURIComponent(draftMessage(draft));}
// Aggregate local counters only. No contact fields, configuration URLs, identifiers or network calls.
export function recordAction(action,storage){
  if(!['film_selected','build_saved','build_loaded','preview_prepared','link_copied','draft_prepared','whatsapp_intent'].includes(action))return;
  try{storage=storage||globalThis.localStorage;const prior=JSON.parse(storage.getItem('zapwrap-studio-actions-v1')||'{}'),counts={};
    for(const key of ['film_selected','build_saved','build_loaded','preview_prepared','link_copied','draft_prepared','whatsapp_intent'])counts[key]=Math.min(1000000,Math.max(0,Number.isSafeInteger(prior[key])?prior[key]:0));
    counts[action]++;storage.setItem('zapwrap-studio-actions-v1',JSON.stringify(counts));
  }catch{/* Measurement never blocks configuration. */}
}
