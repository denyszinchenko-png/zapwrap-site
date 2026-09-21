import {PRODUCTS,BRANDS,filterProducts} from './products.mjs';
import {REGIONS,COLOR_FAMILIES} from './catalog-schema.mjs';
const favoriteKey='zapwrap-film-favorites-v1';
export function createCatalogUI({onSelect,onMessage}){
 const $=s=>document.querySelector(s),filters={region:'US'};let limit=12,favorites=[];
 try{const stored=JSON.parse(localStorage.getItem(favoriteKey));if(Array.isArray(stored))favorites=stored.filter(id=>PRODUCTS.some(p=>p.id===id));}catch{/* Storage is optional. */}
 const populate=(selector,values,first)=>{const select=$(selector);select.replaceChildren(new Option(first,''));for(const value of values)select.add(new Option(value,value));};
 populate('#filter-brand',BRANDS,'All brands');populate('#filter-collection',[...new Set(PRODUCTS.map(p=>p.collection))],'All collections');
 populate('#filter-finish',[...new Set(PRODUCTS.map(p=>p.finish))],'All finishes');populate('#filter-color',COLOR_FAMILIES,'All colors');populate('#filter-region',REGIONS,'All regions');$('#filter-region').value='US';
 let selection=null;
 function render(){
  const rows=filterProducts(PRODUCTS,filters,favorites);$('#film-list').replaceChildren();
  $('#catalog-count').textContent=`${rows.length} of ${PRODUCTS.length} verified products`;
  $('#catalog-empty').hidden=rows.length>0;$('#more-films').hidden=rows.length<=limit;
  for(const product of rows.slice(0,limit)){
   const wrapper=document.createElement('div');wrapper.className='film-entry';
   const button=document.createElement('button');button.type='button';button.className='film-card';button.dataset.product=product.id;
   button.setAttribute('aria-pressed',String(selection===product.id));
   const sample=document.createElement('span');sample.className=`film-sample ${product.renderProfile}`;sample.style.setProperty('--film-color',product.screenColor);sample.setAttribute('aria-hidden','true');
   const label=document.createElement('span'),name=document.createElement('strong'),code=document.createElement('small'),brand=document.createElement('small');
   name.textContent=product.name;code.textContent=product.manufacturerCode||'No published code';brand.textContent=product.brand;label.append(brand,name,code);button.append(sample,label);
   button.addEventListener('click',()=>onSelect(product));
   const star=document.createElement('button');star.type='button';star.className='favorite-toggle';star.textContent=favorites.includes(product.id)?'★':'☆';star.setAttribute('aria-label',`Favorite ${product.brand} ${product.name}`);star.setAttribute('aria-pressed',String(favorites.includes(product.id)));
   star.addEventListener('click',()=>{favorites=favorites.includes(product.id)?favorites.filter(id=>id!==product.id):[...favorites,product.id];try{localStorage.setItem(favoriteKey,JSON.stringify(favorites));}catch{onMessage('Favorites will last for this session only.');}render();});wrapper.append(button,star);$('#film-list').append(wrapper);
  }
 }
 for(const [selector,key] of [['#film-search','query'],['#filter-brand','brand'],['#filter-collection','collection'],['#filter-finish','finish'],['#filter-color','colorFamily'],['#filter-region','region'],['#favorites-only','favorites']]){
  $(selector).addEventListener(selector==='#film-search'?'input':'change',event=>{filters[key]=key==='favorites'?event.target.checked:event.target.value;limit=12;render();});
 }
 $('#clear-filters').addEventListener('click',()=>{for(const key of Object.keys(filters))delete filters[key];filters.region='US';$('#film-search').value='';$('#favorites-only').checked=false;for(const selector of ['#filter-brand','#filter-collection','#filter-finish','#filter-color'])$(selector).value='';$('#filter-region').value='US';limit=12;render();});
 $('#more-films').addEventListener('click',()=>{limit+=12;render();});render();
 return {sync(id){selection=id;document.querySelectorAll('[data-product]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.product===id)));}};
}
