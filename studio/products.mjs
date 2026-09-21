import {RENDER_PROFILES} from './render-profiles.mjs';
import {FILMS} from './data/films.mjs';
import {BRANDS,productErrors,productIdentity} from './catalog-schema.mjs';
export {BRANDS};
export const PREVIEW_DISCLAIMER='Digital previews are approximate. Final color and finish must be confirmed using a physical sample.';
export const CATALOG_RECORDS=FILMS;
export const PRODUCTS=Object.freeze(FILMS.filter(p=>p.verificationStatus==='verified').map(p=>Object.freeze(p)));
const byId=new Map(PRODUCTS.map(p=>[p.id,p]));
export function productById(id){return byId.get(id)||null;}
export function chooseProduct(config,product){return {...config,product:product.id,productVersion:product.version,renderProfileVersion:product.renderProfileVersion,color:product.screenColor,finish:product.finish,shift:false};}
export function validateProducts(records){
 const errors=[],ids=new Set(),identities=new Set();
 for(const [index,p] of records.entries()){
  const issues=productErrors(p,RENDER_PROFILES);
  if(p?.verificationStatus!=='verified')issues.push('Draft cannot appear in client selection');
  const identity=productIdentity(p||{});
  if(ids.has(p?.id)||identities.has(identity))issues.push('Duplicate ID or product identity');
  ids.add(p?.id);identities.add(identity);for(const error of issues)errors.push({index,error});
 }
 return errors;
}
export function filterProducts(records,filters={},favorites=[]){
 const query=String(filters.query||'').trim().toLowerCase(),saved=new Set(favorites);
 return records.filter(p=>p.verificationStatus==='verified'&&(!filters.region||p.region===filters.region||p.region==='global')&&
  ['brand','collection','finish','colorFamily'].every(key=>!filters[key]||p[key]===filters[key])&&
  (!filters.favorites||saved.has(p.id))&&(!query||`${p.name} ${p.manufacturerCode||''} ${p.brand} ${p.collection}`.toLowerCase().includes(query)));
}
