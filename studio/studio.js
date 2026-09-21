import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {ZONES,PARTS,PANEL_LABELS,COLORS,FINISHES,defaultConfig,parseSavedBuild,encodeConfig,decodeConfig,materialZone,isZoneWrapped,colorName,combinedVLT} from './config.mjs?v=20260913-panels';
import {vehicleCatalogPath,localVehicleReview} from './vehicle-review.mjs';

import {PRODUCTS,productById,chooseProduct,PREVIEW_DISCLAIMER,validateProducts} from './products.mjs';
import {RENDER_PROFILES,resolvedProfile} from './render-profiles.mjs';
import {createCatalogUI} from './catalog-ui.mjs';
import {createEnvironments,ENVIRONMENTS} from './environments.mjs';
import {buildLink,readBuildHash,buildWarnings,recordAction} from './handoff.mjs';
import {createHandoffUI,createPreviewUI,createBuildUI,createPasteBuildUI} from './handoff-ui.mjs';
import {createComparisonUI} from './comparison.mjs';
import {mappedPanel,availablePanels,panelMaterialCache,panelIsWrapped} from './panels.mjs';
import {fitVehicleView,orbitTransition} from './camera-framing.mjs';

const $=selector=>document.querySelector(selector);
const stage=$('#stage'),reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let renderer,controls,scene,camera,root,vehicles=[],vehicle,config=defaultConfig();
let generation=0,controller,raf=0,modelReady=false,dead=false,cameraTween,presetView=null,openingFitPending=false;
let showPreview;
let supportedPanels=[],lighting,catalogUI,comparisonUI,contactShadow;
let joints=new Map(),wrapMaterials=new Map(),glassMaterials=new Map();
let statusTimer=0,loadedBytes=0,loadStarted=0;
const tmpQ=new THREE.Quaternion();
const diagnostics={version:1,ready:false,errors:[],vehicle:null,bytes:0,loadMs:0};
window.studioDiagnostics=diagnostics;

function announce(message){clearTimeout(statusTimer);$('#announcement').textContent=message;$('#announcement').classList.add('visible');statusTimer=setTimeout(()=>$('#announcement').classList.remove('visible'),3500);}
function setBusy(busy,message='Loading your vehicle…'){
  $('#loading').hidden=!busy;$('#loading-label').textContent=message;
  $('#configuration').setAttribute('aria-busy',String(busy));
  for(const selector of ['#snapshot','#paste-build','#save-config','#copy-link','#load-config','#open-all','#close-all','#inspect-coverage','#reset-build','#save-A','#save-B'])$(selector).disabled=busy;
}
function showError(message){setBusy(false);$('#error').hidden=false;$('#error-message').textContent=message;modelReady=false;diagnostics.ready=false;diagnostics.errors.push(message);for(const selector of ['#snapshot','#paste-build','#save-config','#copy-link','#open-all','#close-all','#inspect-coverage','#reset-build','#save-A','#save-B'])$(selector).disabled=true;}
function requestFrame(){if(!raf&&!document.hidden&&!dead)raf=requestAnimationFrame(frame);}
function frame(time){
  raf=0;if(dead)return;let moving=false;
  if(controls)moving=controls.update();
  for(const joint of joints.values()){
    if(Math.abs(joint.value-joint.target)>.0005){
      const elapsed=reducedMotion.matches?1:Math.min(1,(time-joint.start)/360);
      const t=1-Math.pow(1-elapsed,3);joint.value=THREE.MathUtils.lerp(joint.from,joint.target,t);
      joint.node.quaternion.copy(joint.closed).multiply(tmpQ.setFromAxisAngle(joint.axis,joint.angle*joint.value));
      moving=moving||elapsed<1;
    }
  }
  if(openingFitPending&&[...joints.values()].every(j=>Math.abs(j.value-j.target)<=.0005)){
    openingFitPending=false;if(presetView)setView(presetView);
  }
  if(cameraTween){
    const t=reducedMotion.matches?1:Math.min(1,(time-cameraTween.start)/280),e=1-Math.pow(1-t,3);
    const pose=orbitTransition(cameraTween.from,cameraTween.to,cameraTween.targetFrom,cameraTween.targetTo,e);
    camera.position.copy(pose.position);controls.target.copy(pose.target);controls.update();moving=true;
    if(t===1)cameraTween=null;
  }
  renderer.render(scene,camera);diagnostics.drawCalls=renderer.info.render.calls;diagnostics.triangles=renderer.info.render.triangles;
  if(moving)requestFrame();
}
function resize(){
  if(!renderer)return;const {width,height}=stage.getBoundingClientRect();if(!width||!height)return;
  const oldFit=Math.max(1,1.8/camera.aspect),newFit=Math.max(1,1.8/(width/height));
  renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
  if(modelReady&&presetView)setView(presetView,true);
  else if(modelReady&&controls&&Math.abs(newFit-oldFit)>.02){camera.position.sub(controls.target).multiplyScalar(newFit/oldFit).add(controls.target);controls.update();}
  diagnostics.viewport={width:innerWidth,bodyWidth:document.body.scrollWidth,canvasWidth:Math.round(width),canvasHeight:Math.round(height)};requestFrame();
}
function initRenderer(){
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(max-width:760px)').matches?1.5:2));
  renderer.setClearColor(0x151518,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  stage.append(renderer.domElement);scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(36,1,.025,100);
  camera.position.set(5,2.1,5.6);controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.68,0);
  controls.enableDamping=true;controls.dampingFactor=.12;controls.enablePan=false;controls.minDistance=1.5;controls.maxDistance=14;controls.maxPolarAngle=Math.PI*.495;
  controls.addEventListener('change',requestFrame);controls.addEventListener('start',()=>{cameraTween=null;clearPresetView();});
  lighting=createEnvironments(renderer,scene);lighting.set(config.environment);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.ShadowMaterial({color:0x000000,opacity:.12}));ground.rotation.x=-Math.PI/2;ground.position.y=-.012;ground.receiveShadow=true;scene.add(ground);
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;
  const shadowContext=shadowCanvas.getContext('2d'),fade=shadowContext.createRadialGradient(64,64,8,64,64,64);
  fade.addColorStop(0,'rgba(0,0,0,.65)');fade.addColorStop(.55,'rgba(0,0,0,.4)');fade.addColorStop(1,'rgba(0,0,0,0)');shadowContext.fillStyle=fade;shadowContext.fillRect(0,0,128,128);
  contactShadow=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false,opacity:.5}));contactShadow.rotation.x=-Math.PI/2;contactShadow.position.y=-.008;scene.add(contactShadow);
  const observer=new ResizeObserver(resize);observer.observe(stage);resize();
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();dead=true;showError('The graphics session was interrupted. Reload the page to restore the preview.');});
  renderer.domElement.addEventListener('webglcontextrestored',()=>location.reload());
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestFrame();});
  stage.addEventListener('keydown',e=>{
    if(stage.dataset.comparing==='true')return;
    const offset=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(offset);
    if(e.key==='ArrowLeft')spherical.theta-=.13;else if(e.key==='ArrowRight')spherical.theta+=.13;
    else if(e.key==='ArrowUp')spherical.phi=Math.max(.1,spherical.phi-.1);else if(e.key==='ArrowDown')spherical.phi=Math.min(Math.PI*.495,spherical.phi+.1);
    else if(e.key==='+'||e.key==='=')spherical.radius=Math.max(controls.minDistance,spherical.radius*.9);
    else if(e.key==='-')spherical.radius=Math.min(controls.maxDistance,spherical.radius*1.1);
    else if(e.key==='Home'){setView('hero');e.preventDefault();return;}else return;
    e.preventDefault();cameraTween=null;clearPresetView();camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));controls.update();requestFrame();
  });
}
function disposeModel(object){
  const materials=new Set(),textures=new Set(),geometries=new Set();
  object.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of [].concat(o.material))materials.add(m);});
  for(const m of materials)for(const v of Object.values(m))if(v?.isTexture)textures.add(v);
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
}
async function fetchModel(url,signal){
  const response=await fetch(url,{signal});if(!response.ok)throw new Error(`Vehicle file unavailable (${response.status}).`);
  const total=Number(response.headers.get('content-length'))||0;loadedBytes=0;
  if(!response.body)return response.arrayBuffer();
  const reader=response.body.getReader(),chunks=[];
  for(;;){const {done,value}=await reader.read();if(done)break;chunks.push(value);loadedBytes+=value.length;if(total)$('#load-progress').value=Math.round(loadedBytes/total*85);}
  const result=new Uint8Array(loadedBytes);let pos=0;for(const chunk of chunks){result.set(chunk,pos);pos+=chunk.length;}return result.buffer;
}
function prepareMaterials(object){
  const cache=panelMaterialCache(),replacements=cache.originals;wrapMaterials.clear();glassMaterials.clear();joints.clear();
  object.traverse(o=>{
    if(o.userData.studioJointId){
      const {studioJointId:id,studioAxis,studioAngle}=o.userData;
      if(!Array.isArray(studioAxis)||!Number.isFinite(studioAngle))return;
      joints.set(id,{node:o,closed:o.quaternion.clone(),axis:new THREE.Vector3(...studioAxis).normalize(),angle:studioAngle,value:0,target:0,from:0,start:0});
    }
    if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;
    o.material=[].concat(o.material).map(original=>{
      if(original.name.startsWith('Glass_'))o.castShadow=false;
      const zone=materialZone(original.name),glass=original.name.startsWith('Glass_');
      if(!zone&&!glass){
        if(original.name.includes('Carbon')){original.color.set(0x171b20);original.map=null;original.metalness=.15;original.roughness=.34;original.clearcoat=.25;original.needsUpdate=true;}
        return original;
      }
      const panel=zone==='exterior'?mappedPanel(o,original,vehicle.panelMapping):null;
      return cache.get(original,panel,()=>{
      let material;
      if(zone){
        material=new THREE.MeshPhysicalMaterial({color:original.color||0xffffff,roughness:.25,metalness:.2,clearcoat:1,clearcoatRoughness:.12,side:THREE.DoubleSide,normalMap:original.normalMap||null,normalScale:original.normalScale?.clone()||new THREE.Vector2(1,1)});
        material.name=original.name;material.userData={...original.userData,zone,panel,factoryColor:original.color.clone()};
        const entries=wrapMaterials.get(zone)||[];entries.push(material);wrapMaterials.set(zone,entries);
      }else{
        material=new THREE.MeshPhysicalMaterial({color:0xf2f7f6,roughness:.08,metalness:0,transmission:.88,thickness:.004,ior:1.46,attenuationColor:new THREE.Color(.55,.6,.58),attenuationDistance:.3,side:THREE.DoubleSide});
        material.name=original.name;material.userData={...original.userData,group:original.name.slice(6)};
        const entries=glassMaterials.get(material.userData.group)||[];entries.push(material);glassMaterials.set(material.userData.group,entries);
        o.castShadow=false;
      }
      return material;
      });
    });if(o.material.length===1)o.material=o.material[0];
  });
  // Source textures stay alive if referenced by any unchanged material.
  const retainedTextures=new Set();object.traverse(o=>{if(o.material)for(const m of [].concat(o.material))for(const value of Object.values(m))if(value?.isTexture)retainedTextures.add(value);});
  for(const original of replacements.keys()){for(const value of Object.values(original))if(value?.isTexture&&!retainedTextures.has(value))value.dispose();original.dispose();}
}
async function loadVehicle(id,restored=false){
  vehicle=vehicles.find(v=>v.id===id&&v.src);if(!vehicle)return;$('#vehicle-select').value=id;
  const mine=++generation;controller?.abort();controller=new AbortController();modelReady=false;diagnostics.ready=false;
  if(!restored){config.vehicle=id;config.parts={};config.assetVersion=null;config.camera=null;restoreNotice('');}
  setBusy(true,`Loading ${vehicle.make} ${vehicle.model}…`);$('#error').hidden=true;$('#load-progress').value=0;loadStarted=performance.now();
  try{
    const asset=new URL(vehicle.src,location.href),buffer=await fetchModel(asset,controller.signal);if(mine!==generation)return;
    $('#loading-label').textContent='Preparing materials…';$('#load-progress').value=90;
    const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);const gltf=await loader.parseAsync(buffer,asset.href.replace(/[^/]+$/,''));
    if(mine!==generation){disposeModel(gltf.scene);return;}
    // Fail closed when bytes differ from the asset that was panel-mapped.
    const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer)),b=>b.toString(16).padStart(2,'0')).join('');
    if(mine!==generation){disposeModel(gltf.scene);return;}
    if(root){scene.remove(root);disposeModel(root);}root=gltf.scene;
    if(Number.isFinite(vehicle.orientation?.yaw))root.rotateY(vehicle.orientation.yaw);
    const assetMatches=vehicle.assetVersion===digest;
    supportedPanels=assetMatches?availablePanels(root,vehicle.panelMapping):[];
    if(config.assetVersion&&config.assetVersion!==digest)restoreNotice('The vehicle asset has changed. Review your restored build.');
    config.assetVersion=digest;vehicle.loadedAssetVersion=digest;
    if(config.wrapTarget!=='full'&&!supportedPanels.includes(config.wrapTarget)){config.wrapTarget='full';announce('That panel is unavailable on this asset. Showing full wrap.');}
    prepareMaterials(root);scene.add(root);
    const box=new THREE.Box3().setFromObject(root),center=box.getCenter(new THREE.Vector3());
    root.position.x-=center.x;root.position.z-=center.z;root.position.y-=box.min.y;
    vehicle.dimensions=box.getSize(new THREE.Vector3()).toArray();contactShadow.scale.set(vehicle.dimensions[0]*1.3,vehicle.dimensions[2]*1.15,1);controls.maxDistance=Math.max(...vehicle.dimensions)*2.8;
    $('#vehicle-select').value=id;$('#vehicle-meta').textContent=`${vehicle.make} / ${vehicle.year}`;$('#vehicle-name').textContent=vehicle.model;$('#vehicle-trim').textContent=vehicle.trim;
    $('#catalog-note').textContent=vehicle.note||'';buildModelControls();applyConfig();const savedCamera=config.camera;
    for(const [key,value] of Object.entries(config.parts))setJoint(key,value,true);
    setView('hero',true);if(savedCamera)restoreCamera(savedCamera);updateCredits();
    modelReady=true;diagnostics.ready=true;diagnostics.vehicle=id;diagnostics.bytes=loadedBytes;diagnostics.loadMs=Math.round(performance.now()-loadStarted);diagnostics.joints=[...joints.keys()];diagnostics.zones=[...wrapMaterials.keys()];diagnostics.glass=[...glassMaterials.keys()];
    setBusy(false);for(const id of ['#open-all','#close-all','#inspect-coverage'])$(id).disabled=!joints.size;
    requestFrame();announce(`${vehicle.make} ${vehicle.model} preview loaded.`);
  }catch(error){if(mine!==generation||error.name==='AbortError')return;showError(error.message||'Please check your connection and try again.');}
}
function applyConfig(){
  lighting?.set(config.environment);$('#environment-select').value=config.environment;$('.lighting-label').textContent=`${ENVIRONMENTS[config.environment].label} · Digital material preview`;
  if(root&&config.wrapTarget!=='full'&&!supportedPanels.includes(config.wrapTarget))config.wrapTarget='full';
  const product=productById(config.product);
  for(const [zone,materials] of wrapMaterials){
    for(const m of materials){
      const wrapped=panelIsWrapped(zone,m.userData.panel,config);m.color.copy(wrapped?new THREE.Color(config.color):m.userData.factoryColor);
      const finish=wrapped?resolvedProfile(config,product):RENDER_PROFILES.gloss;Object.assign(m,finish);m.clearcoatRoughness=finish.clearcoatRoughness??finish.roughness*.65;
      m.iridescenceThicknessRange=[...finish.iridescenceThicknessRange];m.needsUpdate=true;
    }
  }
  // Optical architecture for the owner's future glass appearance controls.
  // VLT is multiplied through the base glass and an added film, never opacity.
  for(const [group,materials] of glassMaterials){
    const film=group==='front_side'?config.glass.front:group==='rear_side'||group==='rear_window'?config.glass.rear:1;
    const vlt=combinedVLT(.88,film);for(const m of materials){m.transmission=.95;m.attenuationColor.setRGB(vlt,vlt,vlt);m.attenuationDistance=.004;}
  }
  document.documentElement.style.setProperty('--accent',config.color);$('#color-name').textContent=product?.name||colorName(config.color);$('#custom-color').value=config.color;$('#hex-value').textContent=config.color.toUpperCase();
  document.querySelectorAll('.swatch').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color===config.color)));
  document.querySelectorAll('[data-finish]').forEach(b=>{const selected=b.dataset.finish===config.finish;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
  $('#color-shift').checked=config.shift;document.querySelector(`input[name="coverage"][value="${config.coverage}"]`).checked=true;$('#inner-zones').disabled=config.coverage!=='extended';
  document.querySelectorAll('[data-zone]').forEach(input=>input.checked=config.zones.includes(input.dataset.zone));
  catalogUI?.sync(config.product);
  $('#wrap-target-select').value=config.wrapTarget;
  $('#panel-note').textContent=supportedPanels.length?'Only individually mapped exterior panels are listed. Other surfaces keep the source model color.':'Individual panels are not available on this model. Choose Full wrap.';
  $('#product-detail').textContent=product?`${product.brand} · ${product.manufacturerCode||'No published code'} · ${product.collection} · ${product.finish}${product.effects.length?' · '+product.effects.join(', '):''}. ${product.region} listing. Manufacturer supply: ${product.manufacturerAvailability}. Zap Wrap stock: ${product.zapWrapStock}.`:'Technical color study. This color and finish are not a verified film product.';
  $('#product-source').hidden=!product;if(product)$('#product-source').href=product.officialSource;
  stage.dataset.wrapTarget=config.wrapTarget;stage.dataset.product=config.product||'technical';
  stage.dataset.finish=config.finish;stage.dataset.environment=config.environment;stage.dataset.mappedPanels=supportedPanels.join(',');
  const count=config.zones.filter(k=>wrapMaterials.has(k)).length;
  $('#summary-color').textContent=`${product?.name||colorName(config.color)} · ${config.finish[0].toUpperCase()+config.finish.slice(1)}${config.shift?' · Color shift':''}`;
  $('#summary-coverage').textContent=config.wrapTarget!=='full'?`${PANEL_LABELS[config.wrapTarget]||config.wrapTarget} only · remaining body uses the source model color`:config.coverage==='exterior'?'Exterior body panels':`Exterior + ${count} inner ${count===1?'area':'areas'}`;
  diagnostics.config=structuredClone(config);requestFrame();
}
function setJoint(key,value,instant=false){
  const joint=joints.get(key);if(!joint)return;value=Math.max(0,Math.min(1,Number(value)||0));
  config.parts[key]=value;joint.from=joint.value;joint.target=value;joint.start=performance.now();
  if(instant||reducedMotion.matches){joint.value=value;joint.node.quaternion.copy(joint.closed).multiply(tmpQ.setFromAxisAngle(joint.axis,joint.angle*value));}
  const input=document.querySelector(`[data-part="${key}"]`);if(input)input.value=String(Math.round(value*100));
  const output=$(`#output-${key}`);if(output)output.textContent=value===0?'Closed':value===1?'Open':`${Math.round(value*100)}% open`;
  diagnostics.config=structuredClone(config);requestFrame();
}
function setView(name,instant=false){
  config.camera=null;
  if(!vehicle||!root)return;presetView=name;
  const bounds=new THREE.Box3().setFromObject(root);
  const saved=[...joints.values()].map(joint=>[joint,joint.node.quaternion.clone()]);
  // Include the pending opening motion before it reaches its final pose.
  try{
    for(const t of [.25,.5,.75,1]){
      for(const [joint] of saved)joint.node.quaternion.copy(joint.closed).multiply(tmpQ.setFromAxisAngle(joint.axis,joint.angle*THREE.MathUtils.lerp(joint.value,joint.target,t)));
      root.updateMatrixWorld(true);bounds.union(new THREE.Box3().setFromObject(root));
    }
  }finally{for(const [joint,q] of saved)joint.node.quaternion.copy(q);root.updateMatrixWorld(true);}
  const {position:to,target}=fitVehicleView(bounds,camera.aspect,name);
  camera.fov=36;camera.updateProjectionMatrix();
  stage.dataset.view=name;stage.dataset.cameraAspect=camera.aspect.toFixed(3);stage.dataset.viewDistance=to.distanceTo(target).toFixed(3);
  controls.minDistance=2*Math.max(...vehicle.dimensions)/4.8;controls.maxDistance=Math.max(controls.maxDistance,to.distanceTo(target)*1.2);controls.maxPolarAngle=Math.PI*.495;
  if(instant||reducedMotion.matches){camera.position.copy(to);controls.target.copy(target);controls.update();cameraTween=null;}
  else cameraTween={from:camera.position.clone(),to,targetFrom:controls.target.clone(),targetTo:target,start:performance.now()};
  document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===name);b.setAttribute('aria-pressed',String(b.dataset.view===name));});requestFrame();
}
function clearPresetView(){
  presetView=null;openingFitPending=false;stage.dataset.view='custom';
  document.querySelectorAll('[data-view]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});
}
function refitOpeningView(){
  if(presetView&&stage.dataset.comparing!=='true'){
    openingFitPending=[...joints.values()].some(j=>Math.abs(j.value-j.target)>.0005);setView(presetView);
  }
}
function buildModelControls(){
  const scope=$('#wrap-target-select');scope.replaceChildren();
  for(const id of ['full',...supportedPanels.filter(id=>Object.hasOwn(PANEL_LABELS,id))]){
    const option=document.createElement('option');option.value=id;option.textContent=id==='full'?'Full wrap':`${PANEL_LABELS[id]} only`;scope.append(option);
  }
  const partRoot=$('#part-controls');partRoot.replaceChildren();
  if(!joints.size){const note=document.createElement('p');note.className='fine-print';note.textContent='Opening assemblies are not available on this asset yet. '+(supportedPanels.length?'Mapped exterior panels can still be selected for wrap previews.':'Full-wrap preview remains available.');partRoot.append(note);}
  for(const id of Object.keys(PARTS)){if(!joints.has(id))continue;
    const row=document.createElement('div');row.className='part-row';const label=document.createElement('label');label.className='part-label';label.htmlFor=`part-${id}`;label.append(PARTS[id]);
    const output=document.createElement('output');output.id=`output-${id}`;output.htmlFor=`part-${id}`;output.textContent='Closed';label.append(output);
    const range=document.createElement('input');range.type='range';range.min='0';range.max='100';range.value='0';range.id=`part-${id}`;range.dataset.part=id;range.setAttribute('aria-describedby',output.id);range.addEventListener('input',()=>{setJoint(id,Number(range.value)/100,true);refitOpeningView();});row.append(label,range);partRoot.append(row);
  }
  const zoneRoot=$('#zone-options');zoneRoot.replaceChildren();
  for(const [id,name] of Object.entries(ZONES)){if(!wrapMaterials.has(id))continue;
    const label=document.createElement('label');label.className='check-row';const input=document.createElement('input');input.type='checkbox';input.dataset.zone=id;input.checked=config.zones.includes(id);input.addEventListener('change',()=>{comparisonUI?.leave();config.zones=[...document.querySelectorAll('[data-zone]:checked')].map(el=>el.dataset.zone);applyConfig();});const span=document.createElement('span');span.textContent=name;label.append(input,span);zoneRoot.append(label);
  }
}
function updateCredits(){
  const box=$('#credits');box.replaceChildren();const text=document.createElement('p');text.textContent=`${vehicle.make} ${vehicle.model} · ${vehicle.year} · ${vehicle.trim}. ${vehicle.provenance}`;box.append(text);
  if(vehicle.credit){const a=document.createElement('a');a.href=vehicle.credit;a.textContent='Asset attribution and license';a.target='_blank';a.rel='noopener';box.append(a);}
}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.hidden=true;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
async function restoreBuild(next){
  comparisonUI?.leave();
  const different=next.vehicle!==config.vehicle;config=next;
  if(different||!modelReady)await loadVehicle(next.vehicle,true);
  else{if(config.assetVersion&&config.assetVersion!==vehicle.loadedAssetVersion)restoreNotice('The saved asset version differs. Please review this build.');config.assetVersion=vehicle.loadedAssetVersion;applyConfig();joints.forEach((_,id)=>setJoint(id,next.parts[id]||0,true));if(next.camera)restoreCamera(next.camera);}
}
function captureBuild(){
  if(!modelReady)return null;
  return {...structuredClone(config),camera:{position:camera.position.toArray(),target:controls.target.toArray()}};
}
function restoreCamera(value){
  cameraTween=null;clearPresetView();config.camera=structuredClone(value);camera.position.fromArray(value.position);controls.target.fromArray(value.target);controls.update();requestFrame();
}
function lockComparison(locked){
  if(controls)controls.enabled=!locked;stage.dataset.comparing=String(locked);
  $('#environment-select').disabled=locked;$('#vehicle-select').disabled=locked;
  for(const selector of ['[data-view]','[data-part]','#open-all','#close-all','#inspect-coverage'])document.querySelectorAll(selector).forEach(b=>b.disabled=locked||(!joints.size&&['open-all','close-all','inspect-coverage'].includes(b.id)));
}
function savePreview(){
  if(!modelReady)return;
  renderer.render(scene,camera);
  const source=renderer.domElement,canvas=document.createElement('canvas');
  canvas.width=1600;const margin=64,header=140,footer=135;
  const imageHeight=Math.round(canvas.width*source.height/source.width);canvas.height=imageHeight+header+footer;
  const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(800,header+imageHeight*.5,0,800,header+imageHeight*.5,1000);
  const background=config.environment==='daylight'?['#657480','#252b30']:config.environment==='evening'?['#5a4439','#181c24']:['#242428','#101011'];gradient.addColorStop(0,background[0]);gradient.addColorStop(1,background[1]);ctx.fillStyle=gradient;ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(source,0,header,canvas.width,imageHeight);
  ctx.fillStyle='#aaaab0';ctx.font='500 19px Montserrat, sans-serif';ctx.fillText(`${vehicle.make.toUpperCase()} / ${vehicle.year}`,margin,48);
  ctx.fillStyle='#f5f5f2';ctx.font='700 42px Montserrat, sans-serif';ctx.fillText(vehicle.model,margin,105);
  ctx.fillStyle='#ffd600';ctx.fillRect(margin,header-13,50,3);
  ctx.font='600 20px Montserrat, sans-serif';ctx.fillStyle='#f5f5f2';ctx.fillText($('#summary-color').textContent,margin,canvas.height-95);
  ctx.font='400 16px Montserrat, sans-serif';ctx.fillStyle='#aaaab0';ctx.fillText($('#summary-coverage').textContent+' · '+ENVIRONMENTS[config.environment].label,margin,canvas.height-65);
  ctx.textAlign='right';ctx.font='600 18px Montserrat, sans-serif';ctx.fillText('Zap Wrap Naples · Digital preview',canvas.width-margin,canvas.height-35);
  ctx.font='400 14px Montserrat, sans-serif';ctx.textAlign='left';ctx.fillText(PREVIEW_DISCLAIMER,margin,canvas.height-12);
  try{canvas.toBlob(blob=>{if(blob){showPreview(blob,`zap-wrap-${config.vehicle}.png`);announce('Preview ready. Review the image and choose Download PNG.');}else announce('The preview could not be exported. Please try again.');},'image/png');}catch{announce('The preview could not be exported. An image source may prevent export.');}
}
function clearProduct(){comparisonUI?.leave();config.product=null;config.productVersion=null;config.renderProfileVersion=null;}
function restoreNotice(message){const note=$('#restore-notice');note.textContent=message;note.hidden=!message;}
async function restoreSavedText(text){
  const next=parseSavedBuild(text,vehicles.filter(v=>v.src).map(v=>v.id)),raw=JSON.parse(text);
  const warnings=buildWarnings(raw,next);restoreNotice(warnings.join(' '));
  await restoreBuild(next);if(!modelReady)throw new Error('The vehicle could not load. Close this dialog and use Try again.');
  const url=new URL(location.href);url.hash='build='+encodeConfig(captureBuild()||config);history.replaceState(null,'',url);recordAction('build_loaded');announce(warnings.join(' ')||'Saved build restored.');
}
function bindUI(){
  createPasteBuildUI({restore:restoreSavedText});
  showPreview=createPreviewUI();
  createHandoffUI({capture:captureBuild,vehicles:()=>vehicles,download,onMessage:announce});
  catalogUI=createCatalogUI({onSelect:product=>{comparisonUI?.leave();config=chooseProduct(config,product);applyConfig();recordAction('film_selected');},onMessage:announce});
  $('#environment-select').addEventListener('change',event=>{config.environment=event.target.value;applyConfig();});
  $('#wrap-target-select').addEventListener('change',e=>{comparisonUI?.leave();config.wrapTarget=e.target.value;applyConfig();});
  $('#reset-build').addEventListener('click',()=>{comparisonUI?.leave();const version=config.assetVersion;config=chooseProduct(defaultConfig(config.vehicle),PRODUCTS[0]);config.assetVersion=version;joints.forEach((_,id)=>setJoint(id,0));applyConfig();setView('hero');history.replaceState(null,'',location.pathname+location.search);restoreNotice('');announce('Build reset.');});
  for(const [name,color] of COLORS){const button=document.createElement('button');button.type='button';button.className='swatch';button.dataset.color=color;button.style.setProperty('--swatch',color);button.setAttribute('aria-label',name);button.title=name;button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>{clearProduct();config.color=color;applyConfig();});$('#swatches').append(button);}
  $('#custom-color').addEventListener('input',e=>{clearProduct();config.color=e.target.value;applyConfig();});$('#color-shift').addEventListener('change',e=>{clearProduct();config.shift=e.target.checked;applyConfig();});
  document.querySelectorAll('[data-finish]').forEach(b=>b.addEventListener('click',()=>{clearProduct();config.finish=b.dataset.finish;applyConfig();}));
  document.querySelectorAll('[name=coverage]').forEach(b=>b.addEventListener('change',()=>{comparisonUI?.leave();config.coverage=b.value;applyConfig();}));
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  const tabs=[...document.querySelectorAll('[role=tab]')];const activate=tab=>{tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!selected;});};
  tabs.forEach(tab=>{tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',e=>{let index=tabs.indexOf(tab);if(e.key==='ArrowRight')index=(index+1)%tabs.length;else if(e.key==='ArrowLeft')index=(index+tabs.length-1)%tabs.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=tabs.length-1;else return;e.preventDefault();activate(tabs[index]);tabs[index].focus();});});
  $('#open-all').addEventListener('click',()=>{joints.forEach((_,id)=>setJoint(id,1));refitOpeningView();});$('#close-all').addEventListener('click',()=>{joints.forEach((_,id)=>setJoint(id,0));refitOpeningView();});
  $('#inspect-coverage').addEventListener('click',()=>{joints.forEach((_,id)=>setJoint(id,1));setView('hero');});
  $('#vehicle-select').addEventListener('change',e=>loadVehicle(e.target.value));$('#retry').addEventListener('click',()=>dead?location.reload():loadVehicle(config.vehicle,true));
  $('#credits-toggle').addEventListener('click',()=>{const hidden=!$('#credits').hidden;$('#credits').hidden=hidden;$('#credits-toggle').setAttribute('aria-expanded',String(!hidden));});
  $('#copy-link').addEventListener('click',async()=>{try{const link=buildLink(captureBuild()||config,location.href,vehicles.filter(v=>v.src).map(v=>v.id));history.replaceState(null,'',link.url);await navigator.clipboard.writeText(link.url);recordAction('link_copied');announce(link.local?'Local preview link copied. It opens on this computer while the preview server is running.':'Preview link copied. It includes the configuration, without contact details.');}catch{announce('The link could not be copied. Use Save build to transfer your configuration.');}});
  $('#save-config').addEventListener('click',createBuildUI({capture:captureBuild,ids:()=>vehicles.filter(v=>v.src).map(v=>v.id),download,onMessage:announce}));
  $('#load-config').addEventListener('click',()=>$('#build-file').click());
  $('#build-file').addEventListener('change',async e=>{
    const file=e.target.files[0];e.target.value='';if(!file)return;
    try{
      if(file.size>65536)throw new Error('Choose a saved Zap Wrap build file under 64 KB.');
      await restoreSavedText(await file.text());
    }catch(error){announce(error.message||'This build could not be opened.');}
  });
  $('#snapshot').addEventListener('click',savePreview);
  window.addEventListener('hashchange',async()=>{try{const next=readBuildHash(location.hash,vehicles.filter(v=>v.src).map(v=>v.id));if(next){restoreNotice(buildWarnings(JSON.parse(atob(location.hash.slice(7))),next).join(' '));await restoreBuild(next);recordAction('build_loaded');}}catch(error){restoreNotice(error.message);announce(error.message);}});
}
async function main(){
  bindUI();
  try{
    if(validateProducts(PRODUCTS).length)throw new Error('The film catalog did not pass validation.');
    const catalogURL=new URL(vehicleCatalogPath(location),import.meta.url);catalogURL.searchParams.set('v',new URL(import.meta.url).searchParams.get('v')||'dev');
    const response=await fetch(catalogURL,{cache:'no-store'});if(!response.ok)throw new Error('Vehicle catalog is unavailable.');
    const catalog=await response.json();vehicles=catalog.vehicles;
    if(localVehicleReview(location)){$('#review-notice').hidden=false;document.title='Zap Wrap | Local vehicle preparation';}
    for(const car of vehicles){const option=document.createElement('option');option.value=car.id;option.disabled=!car.src;option.textContent=`${car.make} ${car.model} · ${car.year}${car.src?'':' · In progress'}`;$('#vehicle-select').append(option);}
    const available=vehicles.filter(v=>v.src).map(v=>v.id);if(!available.length)throw new Error('The first model is still being prepared.');
    comparisonUI=createComparisonUI({capture:captureBuild,restore:restoreBuild,vehicleIds:()=>available,lock:lockComparison,onMessage:announce});
    let restored=null,restoreError='';try{restored=readBuildHash(location.hash,available);}catch(error){restoreError=error.message;}
    config=restored||chooseProduct(defaultConfig(available.includes(catalog.defaultVehicle)?catalog.defaultVehicle:available[0]),PRODUCTS[0]);if(restoreError)restoreNotice(restoreError);else if(restored)restoreNotice(buildWarnings(JSON.parse(atob(location.hash.slice(7))),restored).join(' '));initRenderer();applyConfig();await loadVehicle(config.vehicle,true);if(restoreError)announce(restoreError);
  }catch(error){showError(error.message||'This browser could not start the 3D studio.');}
}
main();
