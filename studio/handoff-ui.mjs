import {buildLink,readBuildHash,createDraft,draftMessage,whatsappLink,DRAFT_KEY,recordAction} from './handoff.mjs';

export function createHandoffUI({capture,vehicles,download,onMessage}){
  const dialog=document.querySelector('#inquiry-dialog'),form=document.querySelector('#inquiry-form'),review=document.querySelector('#inquiry-review'),status=document.querySelector('#inquiry-status');
  let snapshot=null,intent='quote';
  const forget=()=>{try{localStorage.removeItem(DRAFT_KEY);}catch{}};
  function clearReview(){review.hidden=true;document.querySelector('#whatsapp-handoff').removeAttribute('href');}
  for(const button of document.querySelectorAll('[data-inquiry]'))button.addEventListener('click',()=>{
    snapshot=capture();if(!snapshot){onMessage('Wait for your vehicle to load.');return;}
    intent=button.dataset.inquiry;clearReview();status.textContent='';
    document.querySelector('#inquiry-title').textContent=button.textContent;
    try{const saved=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null');if(saved?.version===1&&saved?.status==='local-draft'){
      for(const key of ['name','contact','comment'])if(typeof saved[key]==='string')form.elements[key].value=saved[key].slice(0,key==='comment'?1500:160);
      form.elements.remember.checked=true;
    }}catch{forget();}
    dialog.showModal();
  });
  document.querySelector('#close-inquiry').addEventListener('click',()=>dialog.close());
  form.addEventListener('input',clearReview);
  document.querySelector('#copy-request-text').addEventListener('click',async()=>{
    if(review.hidden)return;
    try{await navigator.clipboard.writeText(document.querySelector('#inquiry-text').textContent);status.textContent='Request text copied. Paste it into your conversation with Zap Wrap. Nothing has been sent.';}
    catch{status.textContent='Copy is unavailable in this browser. Select and copy the request text below.';}
  });
  form.elements.remember.addEventListener('change',()=>{if(!form.elements.remember.checked)forget();});
  document.querySelector('#forget-draft').addEventListener('click',()=>{forget();form.reset();clearReview();status.textContent='Saved contact draft removed from this browser.';});
  form.addEventListener('submit',event=>{
    event.preventDefault();clearReview();
    try{
      const data=Object.fromEntries(new FormData(form));
      const draft=createDraft({...data,intent},snapshot,vehicles(),location.href);
      let persistence='Your request is prepared in this window. Nothing has been sent.';
      if(form.elements.remember.checked){try{localStorage.setItem(DRAFT_KEY,JSON.stringify(draft));persistence='Draft saved on this device. Nothing has been sent.';}catch{persistence='Device storage is unavailable. Your draft is prepared in this window only.';}}else forget();
      document.querySelector('#inquiry-text').textContent=draftMessage(draft);
      const link=document.querySelector('#whatsapp-handoff');link.href=whatsappLink(draft);
      document.querySelector('#download-request').onclick=()=>download(new Blob([JSON.stringify(draft,null,2)],{type:'application/json'}),'zap-wrap-private-request.json');
      review.hidden=false;status.textContent=persistence;recordAction('draft_prepared');review.focus();
    }catch(error){status.textContent=error.message;}
  });
  document.querySelector('#whatsapp-handoff').addEventListener('click',()=>recordAction('whatsapp_intent'));
}

export function createPreviewUI(){
  const dialog=document.querySelector('#preview-dialog'),image=document.querySelector('#preview-image'),link=document.querySelector('#download-preview');let url=null;
  const clear=()=>{image.removeAttribute('src');link.removeAttribute('href');if(url)URL.revokeObjectURL(url);url=null;};
  document.querySelector('#close-preview').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',clear);
  return (blob,name)=>{clear();url=URL.createObjectURL(blob);image.src=url;link.href=url;link.download=name;dialog.showModal();recordAction('preview_prepared');};
}

export function createBuildUI({capture,ids,download,onMessage}){
  const dialog=document.querySelector('#build-dialog'),text=document.querySelector('#build-json');
  const status=document.querySelector('#build-status');
  document.querySelector('#close-build').addEventListener('click',()=>dialog.close());
  document.querySelector('#download-build').addEventListener('click',()=>{download(new Blob([text.value],{type:'application/json'}),'zap-wrap-build.json');recordAction('build_saved');});
  document.querySelector('#copy-build-json').addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(text.value);status.textContent='Build JSON copied. Save it as a .json file, or use Paste a saved build in another studio window.';recordAction('build_saved');}catch{text.select();status.textContent='Copy the selected JSON text and save it as a .json file.';}
  });
  return ()=>{const build=capture();if(!build)return;status.textContent='';const link=buildLink(build,location.href,ids());text.value=JSON.stringify(readBuildHash(new URL(link.url).hash,ids()),null,2);dialog.showModal();};
}

export function createPasteBuildUI({restore}){
  const dialog=document.querySelector('#paste-build-dialog'),form=document.querySelector('#paste-build-form'),text=document.querySelector('#paste-build-json'),status=document.querySelector('#paste-build-status'),submit=document.querySelector('#restore-pasted-build');
  document.querySelector('#paste-build').addEventListener('click',()=>{status.textContent='';dialog.showModal();});
  document.querySelector('#close-paste-build').addEventListener('click',()=>dialog.close());
  form.addEventListener('submit',async event=>{
    event.preventDefault();submit.disabled=true;status.textContent='Restoring your build…';
    try{await restore(text.value);text.value='';dialog.close();}catch(error){status.textContent=error.message||'This build could not be opened.';}finally{submit.disabled=false;}
  });
}
