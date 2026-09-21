import {productErrors,productIdentity,BRANDS} from './catalog-schema.mjs';
import {RENDER_PROFILES} from './render-profiles.mjs';
export const IMPORT_FIELDS=['id','version','brand','collection','name','manufacturerCode','category','finish','colorFamily','effects','region','verificationStatus','updatedAt','officialSource','regionSource','regionSourceDate','verificationScope','swatchOrigin','screenColor','renderProfile','renderProfileVersion','rollWidthInches','manufacturerAvailability','zapWrapStock','availabilityEvidence'];
export function parseCSV(text){
 const rows=[];let row=[],cell='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){
  const char=text[i];
  if(quoted){if(char==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=char;continue;}
  if(char==='"'){if(cell||closed)throw new Error('Unexpected quote in CSV');quoted=true;continue;}
  if(char===','||char==='\n'||char==='\r'){
   row.push(cell);cell='';closed=false;
   if(char!==','){if(char==='\r'&&text[i+1]==='\n')i++;if(row.some(v=>v!==''))rows.push(row);row=[];}continue;
  }
  if(closed){if(char===' '||char==='\t')continue;throw new Error('Characters after closing CSV quote');}cell+=char;
 }
 if(quoted)throw new Error('Unclosed CSV quote');
 if(cell||row.length||closed){row.push(cell);rows.push(row);}
 if(!rows.length)throw new Error('CSV is empty');
 const headers=rows.shift().map(h=>h.trim());
 if(new Set(headers).size!==headers.length||headers.some(h=>!IMPORT_FIELDS.includes(h)))throw new Error('Duplicate or unknown CSV columns');
 return rows.map((values,index)=>{
  if(values.length!==headers.length)throw new Error(`CSV row ${index+2}: wrong column count`);
  const record=Object.fromEntries(headers.map((h,i)=>[h,values[i].trim()]));
  for(const key of ['version','renderProfileVersion','rollWidthInches'])if(key in record)record[key]=record[key]===''?null:Number(record[key]);
  if('effects' in record)record.effects=record.effects?record.effects.split('|').map(s=>s.trim()):[];
  if(record.manufacturerCode==='')record.manufacturerCode=null;
  return record;
 });
}
export function parseImport(text,format){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>8*1024*1024)throw new Error('Import exceeds the 8 MiB file safety limit');
 text=text.replace(/^\uFEFF/,'');
 if(format==='csv')return parseCSV(text);
 const value=JSON.parse(text);
 const rows=Array.isArray(value)?value:value?.version===1?value.products:null;
 if(!Array.isArray(rows))throw new Error('Expected a product array or {version:1, products:[]}');
 return rows;
}
export function mergeCatalog(existing,incoming,{reviewed=false}={}){
 const records=new Map(existing.map(p=>[p.id,p])),identities=new Map(existing.map(p=>[productIdentity(p),p.id]));
 const seenIds=new Set(),seenIdentity=new Set();const report={inserted:0,updated:0,unchanged:0,drafts:0,errors:[],coverage:{complete:false,scope:'Starter selection; official collection totals have not been audited',brands:{}}};
 for(const [index,raw] of incoming.entries()){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)){report.errors.push({row:index+1,id:null,errors:['Product must be an object']});continue;}
  const canonical=value=>Object.fromEntries(IMPORT_FIELDS.filter(k=>Object.hasOwn(value,k)&&value[k]!==undefined&&!(value[k]===''&&['regionSourceDate','availabilityEvidence'].includes(k))).map(k=>[k,value[k]]));
  const p=canonical(raw);
  // A file claiming "verified" does not establish factual verification.
  if(!reviewed)p.verificationStatus='draft';
  const errors=productErrors(p,RENDER_PROFILES);
  const unknown=Object.keys(raw).filter(k=>!IMPORT_FIELDS.includes(k));if(unknown.length)errors.push('Unknown fields: '+unknown.join(', '));
  const identity=productIdentity(p),previous=records.get(p.id);
  if(seenIds.has(p.id)||seenIdentity.has(identity))errors.push('Duplicate record in import');
  seenIds.add(p.id);seenIdentity.add(identity);
  if(identities.has(identity)&&identities.get(identity)!==p.id)errors.push('Product already exists under a different stable ID');
  if(previous&&productIdentity(previous)!==identity)errors.push('Stable ID cannot be reassigned to another product');
  if(previous?.verificationStatus==='verified'&&p.verificationStatus!=='verified')errors.push('A draft update cannot replace a verified product; keep the candidate file for source review');
  const unchanged=previous&&JSON.stringify(canonical(previous))===JSON.stringify(p);
  if(previous&&!unchanged&&p.version<=previous.version)errors.push('Changed record requires a higher product version');
  if(errors.length){report.errors.push({row:index+1,id:p.id||null,errors});continue;}
  if(unchanged)report.unchanged++;else if(previous)report.updated++;else report.inserted++;
  records.set(p.id,p);identities.set(identity,p.id);
 }
 const products=[...records.values()];report.drafts=products.filter(p=>p.verificationStatus==='draft').length;
 for(const brand of BRANDS){const rows=products.filter(p=>p.brand===brand);report.coverage.brands[brand]={verified:rows.filter(p=>p.verificationStatus==='verified').length,drafts:rows.filter(p=>p.verificationStatus==='draft').length,officialTotal:null,missingCount:null};}
 report.coverage.missingBrands=BRANDS.filter(brand=>report.coverage.brands[brand].verified===0);
 return {products,report};
}
