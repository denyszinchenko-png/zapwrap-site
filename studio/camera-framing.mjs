import {Vector3,Spherical,MathUtils} from './assets/vendor/three/build/three.module.js';

// Fit every bounds corner in camera space, including depth. A length-based
// distance alone clips raised panels and wastes space on portrait screens.
export function fitVehicleView(box,aspect,view='hero',fov=36){
  const target=box.getCenter(new Vector3());
  const directions={hero:[3.7,1.35,4.2],side:[5.6,.42,0],front:[0,.47,5.7],rear:[0,.62,-5.7]};
  const back=new Vector3(...(directions[view]||directions.hero)).normalize();
  const right=new Vector3().crossVectors(new Vector3(0,1,0),back).normalize();
  const up=new Vector3().crossVectors(back,right).normalize();
  const vertical=Math.tan(MathUtils.degToRad(fov/2)),horizontal=vertical*Math.max(.1,aspect);
  let distance=1;
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
    const p=new Vector3(x,y,z).sub(target),depth=p.dot(back);
    distance=Math.max(distance,depth+1.22*Math.abs(p.dot(right))/horizontal,depth+1.22*Math.abs(p.dot(up))/vertical);
  }
  return {target,position:target.clone().addScaledVector(back,distance),distance};
}

// Shortest azimuth arc with interpolated radius, never a chord through the car.
export function orbitTransition(from,to,targetFrom,targetTo,t){
  const a=new Spherical().setFromVector3(from.clone().sub(targetFrom));
  const b=new Spherical().setFromVector3(to.clone().sub(targetTo));
  const delta=Math.atan2(Math.sin(b.theta-a.theta),Math.cos(b.theta-a.theta));
  const target=targetFrom.clone().lerp(targetTo,t);
  const spherical=new Spherical(MathUtils.lerp(a.radius,b.radius,t),MathUtils.lerp(a.phi,b.phi,t),a.theta+delta*t);
  return {target,position:new Vector3().setFromSpherical(spherical).add(target)};
}
