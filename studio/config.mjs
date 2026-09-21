import {RENDER_PROFILES} from './render-profiles.mjs';
import {productById,chooseProduct,PREVIEW_DISCLAIMER} from './products.mjs';
export const ZONES = {
  door_returns:'Door edges & returns', jambs:'Door openings & sills',
  hood_under:'Inside the hood', engine_bay:'Exposed engine bay metal',
  trunk_under:'Inside the trunk lid', trunk_jamb:'Trunk opening',
};
export const PARTS = {door_fl:'Front left door',door_fr:'Front right door',door_rl:'Rear left door',door_rr:'Rear right door',hood:'Hood',trunk:'Trunk',frunk:'Front luggage compartment',engine_cover:'Engine cover',tailgate:'Tailgate'};
export const PANEL_LABELS = {hood:'Hood',roof:'Roof',trunk:'Trunk lid',door_fl:'Front left door',door_fr:'Front right door',door_rl:'Rear left door',door_rr:'Rear right door',fender_fl:'Front left fender',fender_fr:'Front right fender',bumper_front:'Front bumper',bumper_rear:'Rear bumper',mirror_left:'Left mirror',mirror_right:'Right mirror'};
export const COLORS = [
  ['Midnight purple','#542a86'],['Electric blue','#184fa4'],['Ruby red','#9e1538'],
  ['Racing green','#145540'],['Sunset orange','#ee651d'],['Hot pink','#d44d96'],
  ['Champagne','#ac9871'],['Glacier white','#e8e7e2'],['Nardo gray','#6e747b'],
  ['Graphite','#35363b'],['Deep black','#0c0c0e'],['Acid yellow','#cedc36'],
];
export const FINISHES=RENDER_PROFILES;
export function defaultConfig(vehicle='bmw-m3-lci'){
  return {version:1,vehicle,assetVersion:null,product:null,productVersion:null,renderProfileVersion:null,wrapTarget:'full',environment:'studio',camera:null,previewDisclaimer:PREVIEW_DISCLAIMER,color:'#542a86',finish:'gloss',shift:false,coverage:'exterior',zones:Object.keys(ZONES),parts:{},glass:{front:1,rear:1}};
}
export function validateConfig(value,availableIds){
  const fallback=defaultConfig(availableIds[0]);
  if(!value||typeof value!=='object'||Array.isArray(value))return fallback;
  const out={...fallback};
  if(availableIds.includes(value.vehicle))out.vehicle=value.vehicle;
  if(typeof value.color==='string'&&/^#[\da-f]{6}$/i.test(value.color))out.color=value.color.toLowerCase();
  if(Object.hasOwn(FINISHES,value.finish))out.finish=value.finish;
  if(value.coverage==='extended')out.coverage='extended';
  out.shift=value.shift===true;
  if(Array.isArray(value.zones))out.zones=[...new Set(value.zones.filter(k=>Object.hasOwn(ZONES,k)))];
  if(value.parts&&typeof value.parts==='object')for(const [key,val] of Object.entries(value.parts)){
    if(Object.hasOwn(PARTS,key)&&Number.isFinite(val))out.parts[key]=Math.max(0,Math.min(1,val));
  }
  if(value.glass&&typeof value.glass==='object')for(const key of ['front','rear']){
    if([1,.2,.3,.5,.7].includes(value.glass[key]))out.glass[key]=value.glass[key];
  }
  if(Object.hasOwn(PANEL_LABELS,value.wrapTarget))out.wrapTarget=value.wrapTarget;
  if(typeof value.assetVersion==='string'&&/^[a-f0-9]{64}$/.test(value.assetVersion))out.assetVersion=value.assetVersion;
  if(['studio','daylight','evening'].includes(value.environment))out.environment=value.environment;
  if(value.camera&&['position','target'].every(key=>Array.isArray(value.camera[key])&&value.camera[key].length===3&&value.camera[key].every(v=>Number.isFinite(v)&&Math.abs(v)<=100))){const distance=Math.hypot(...value.camera.position.map((v,i)=>v-value.camera.target[i]));if(distance>=.1)out.camera={position:[...value.camera.position],target:[...value.camera.target]};}
  const product=productById(value.product);
  if(product&&value.productVersion===product.version&&value.renderProfileVersion===product.renderProfileVersion)Object.assign(out,chooseProduct(out,product));
  return out;
}
export function encodeConfig(value){return btoa(JSON.stringify(value));}
export function decodeConfig(hash,ids){
  try{return validateConfig(JSON.parse(atob(hash.replace(/^#build=/,''))),ids);}catch{return defaultConfig(ids[0]);}
}
export function parseSavedBuild(text,ids){
  if(typeof text!=='string'||text.length>65536)throw new Error('Choose a saved Zap Wrap build file under 64 KB.');
  let value;try{value=JSON.parse(text);}catch{throw new Error('This file is not a valid saved build.');}
  if(!value||value.version!==1||!ids.includes(value.vehicle))throw new Error('This build uses a vehicle or format that is unavailable in this studio.');
  return validateConfig(value,ids);
}
export function materialZone(name){return typeof name==='string'&&name.startsWith('Wrap_')?name.slice(5).replace(/\.\d+$/,''):null;}
export function isZoneWrapped(zone,config){return zone==='exterior'||(config.coverage==='extended'&&config.zones.includes(zone));}
export function colorName(color){return COLORS.find(([,hex])=>hex===color)?.[0]||'Custom color';}
export function combinedVLT(base,film){return Math.max(.01,Math.min(1,base))*Math.max(.01,Math.min(1,film));}
