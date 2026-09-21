import {PROFILE_VERSION} from './render-profiles.mjs';
export const BRANDS=Object.freeze(['Avery Dennison','3M','HEXIS','KPMF','TeckWrap']);
export const REGIONS=['US','EU','UK','global'];
export const FINISH_IDS=['gloss','satin','matte','metallic','pearlescent','chrome','color-shift'];
export const COLOR_FAMILIES=['black','white','gray','silver','red','orange','yellow','green','blue','purple','pink','brown','gold','multicolor'];
export const EFFECTS=['metallic','pearlescent','chrome','color-shift'];
const OFFICIAL_HOSTS={'Avery Dennison':['averydennison.com','graphics.averydennison.com'],'3M':['3m.com','multimedia.3m.com'],'HEXIS':['hexis-graphics.com','hexisamericas.com','store.hexisamericas.com'],'KPMF':['kpmf.com'],'TeckWrap':['teckwrap.com']};
export function officialURL(value,brand){try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password&&OFFICIAL_HOSTS[brand]?.includes(url.hostname.replace(/^www\./,''));}catch{return false;}}
const text=(v,max=240)=>typeof v==='string'&&v.trim().length>0&&v.length<=max&&!/[\u0000-\u001f]/.test(v);
export function productErrors(p,profiles){
 if(!p||typeof p!=='object'||Array.isArray(p))return ['Product must be an object'];
 const errors=[];
 if(!text(p.id,100)||!/^[a-z0-9][a-z0-9-]{0,99}$/.test(p.id||''))errors.push('Invalid stable ID');
 if(!Number.isSafeInteger(p.version)||p.version<1)errors.push('Invalid product version');
 if(!BRANDS.includes(p.brand))errors.push('Unknown brand');
 for(const key of ['collection','name','swatchOrigin'])if(!text(p[key]))errors.push(`Missing or invalid ${key}`);
 if(p.manufacturerCode!==null&&!text(p.manufacturerCode,80))errors.push('Invalid manufacturer code');
 if(p.category!=='automotive-color-change-vinyl')errors.push('Unsupported product category');
 if(!FINISH_IDS.includes(p.finish)||!COLOR_FAMILIES.includes(p.colorFamily))errors.push('Invalid finish or color family');
 if(!Array.isArray(p.effects)||p.effects.some(e=>!EFFECTS.includes(e))||new Set(p.effects).size!==p.effects.length)errors.push('Invalid effects');
 if(!REGIONS.includes(p.region))errors.push('Invalid region');
 if(!['verified','draft'].includes(p.verificationStatus))errors.push('Invalid verification status');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(p.updatedAt||'')||Number.isNaN(Date.parse(p.updatedAt))||new Date(p.updatedAt).toISOString().slice(0,10)!==p.updatedAt)errors.push('Invalid update date');
 if(!officialURL(p.officialSource,p.brand)||!officialURL(p.regionSource,p.brand))errors.push('Official product and region sources required');
 if(!text(p.verificationScope,1000))errors.push('Verification scope required');
 if(!/^#[\da-f]{6}$/i.test(p.screenColor||''))errors.push('Invalid screen color');
 if(!Object.hasOwn(profiles,p.renderProfile)||p.renderProfileVersion!==PROFILE_VERSION)errors.push('Unknown render profile or revision');
 if(p.rollWidthInches!==null&&(!Number.isFinite(p.rollWidthInches)||p.rollWidthInches<=0||p.rollWidthInches>120))errors.push('Invalid roll width');
 for(const key of ['manufacturerAvailability','zapWrapStock'])if(!['unknown','available','unavailable','backorder'].includes(p[key]))errors.push(`Invalid ${key}`);
 if((p.manufacturerAvailability!=='unknown'||p.zapWrapStock!=='unknown')&&!text(p.availabilityEvidence,1000))errors.push('Dated evidence required for availability claims');
 return errors;
}
export function productIdentity(p){return [p.brand,p.collection,p.manufacturerCode||p.name,p.region].map(v=>String(v).trim().toLowerCase()).join('|');}
