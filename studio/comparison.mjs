import {validateConfig} from './config.mjs';
import {productById} from './products.mjs';
export function candidateValid(candidate,ids){
 if(!candidate||typeof candidate.assetVersion!=='string'||!/^[a-f0-9]{64}$/.test(candidate.assetVersion)||candidate.version!==1||!ids.includes(candidate.vehicle)||!candidate.camera)return false;
 if(candidate.product){const p=productById(candidate.product);if(!p||p.version!==candidate.productVersion||p.renderProfileVersion!==candidate.renderProfileVersion)return false;}
 return validateConfig(candidate,ids).camera!==null;
}
export function comparisonConfig(slots,id){
 const base=slots.A,chosen=slots[id];
 if(!base||!chosen)throw new Error('Save both options before comparing.');
 if(base.vehicle!==chosen.vehicle||base.assetVersion!==chosen.assetVersion)throw new Error('Compare options for the same vehicle and asset version.');
 // Camera, environment, exposure (fixed at 1) and openings are shared from A.
 return {...structuredClone(chosen),camera:structuredClone(base.camera),environment:base.environment,parts:structuredClone(base.parts)};
}
export function createComparisonUI({capture,restore,vehicleIds,lock,onMessage}){
 const $=s=>document.querySelector(s),key='zapwrap-film-comparison-v1';let slots={},active=null;
 try{const saved=JSON.parse(localStorage.getItem(key));for(const id of ['A','B'])if(candidateValid(saved?.[id],vehicleIds()))slots[id]=validateConfig(saved[id],vehicleIds());}catch{/* Optional local storage. */}
 function label(candidate){const product=productById(candidate?.product);return product?`${product.brand} ${product.name}`:candidate?`${candidate.color} · ${candidate.finish}`:'Not saved';}
 function sync(){
  for(const id of ['A','B']){$(`#compare-label-${id}`).textContent=label(slots[id]);$(`#show-${id}`).disabled=!slots.A||!slots.B;$(`#show-${id}`).setAttribute('aria-pressed',String(active===id));}
  $('#leave-comparison').hidden=!active;$('#compare-note').textContent=active?`Viewing ${active}. Camera, lighting and openings are locked to option A.`:'Save two options for this vehicle. Compare them under the same camera and lighting.';
 }
 function leave(){active=null;lock(false);sync();}
 for(const id of ['A','B']){
  $(`#save-${id}`).addEventListener('click',()=>{
   const candidate=capture();if(!candidate)return;
   const other=slots[id==='A'?'B':'A'];if(other&&(other.vehicle!==candidate.vehicle||other.assetVersion!==candidate.assetVersion)){onMessage('Use the same vehicle for both options, or clear the comparison.');return;}
   slots[id]=candidate;leave();try{localStorage.setItem(key,JSON.stringify(slots));}catch{onMessage('Comparison saved for this session only.');}sync();onMessage(`Option ${id} saved.`);
  });
  $(`#show-${id}`).addEventListener('click',async()=>{
   try{const state=comparisonConfig(slots,id);if(!candidateValid(state,vehicleIds()))throw new Error('A saved product changed. Save this option again.');await restore(state);if(capture()?.assetVersion!==state.assetVersion)throw new Error('The saved vehicle asset changed. Save both options again.');active=id;lock(true);sync();}catch(error){leave();onMessage(error.message);}
  });
 }
 $('#leave-comparison').addEventListener('click',leave);
 $('#clear-comparison').addEventListener('click',()=>{slots={};leave();try{localStorage.removeItem(key);}catch{/* Session cleared. */}});sync();return {leave};
}
