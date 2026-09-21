import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
export const ENVIRONMENTS={studio:{label:'Neutral studio',intensity:.85,key:1.6,fill:.5,color:0xffffff,position:[2.5,7,3]},daylight:{label:'Daylight',intensity:.8,key:2,fill:.7,color:0xfff8eb,position:[-3,6,4]},evening:{label:'Warm evening',intensity:.7,key:1.8,fill:.3,color:0xffba79,position:[-5,2,3]}};
// Small authored sky and sun environment, not a photo location or third-party HDRI.
function outdoor(evening){
 const world=new THREE.Scene(),geometry=new THREE.SphereGeometry(50,32,16),positions=geometry.attributes.position;
 const colors=[],top=new THREE.Color(evening?'#354765':'#8bacce'),horizon=new THREE.Color(evening?'#d3a37c':'#d5e0e5'),ground=new THREE.Color(evening?'#433c37':'#646762');
 for(let i=0;i<positions.count;i++){const y=positions.getY(i)/50,color=y>=0?horizon.clone().lerp(top,Math.pow(y,.5)):horizon.clone().lerp(ground,Math.min(1,-y*5));colors.push(color.r,color.g,color.b);}
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));world.add(new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({side:THREE.BackSide,vertexColors:true})));
 const sun=new THREE.Mesh(new THREE.SphereGeometry(evening?2.5:1.5,16,8),new THREE.MeshBasicMaterial({color:new THREE.Color().setRGB(8,evening?4.8:7.7,evening?2.8:7)}));sun.position.set(evening?-35:-22,evening?10:30,22);world.add(sun);return world;
}
export function createEnvironments(renderer,scene){
 const cache=new Map();let current=null;
 const fill=new THREE.HemisphereLight(0xffffff,0x292929,.5),key=new THREE.DirectionalLight(0xffffff,1.6),rim=new THREE.DirectionalLight(0xffffff,.65);rim.position.set(-4,3,-4);
 key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5});key.shadow.radius=4;key.shadow.normalBias=.015;key.shadow.bias=-.0003;scene.add(fill,key,rim);
 return {set(id){
  if(!Object.hasOwn(ENVIRONMENTS,id))id='studio';if(id===current)return;current=id;
  if(!cache.has(id)){
   const env=id==='studio'?new RoomEnvironment():outdoor(id==='evening'),generator=new THREE.PMREMGenerator(renderer);
   const target=generator.fromScene(env,.04);generator.dispose();
   if(env.dispose)env.dispose();else env.traverse(node=>{node.geometry?.dispose();node.material?.dispose();});cache.set(id,target);
  }
  const settings=ENVIRONMENTS[id];scene.environment=cache.get(id).texture;scene.environmentIntensity=settings.intensity;
  key.color.set(settings.color);key.intensity=settings.key;key.position.set(...settings.position);fill.intensity=settings.fill;
  renderer.toneMappingExposure=1;document.querySelector('.viewer').dataset.environment=id;
 },dispose(){cache.forEach(target=>target.dispose());cache.clear();key.shadow.map?.dispose();}};
}
