// Authored visual approximations. No profile is a manufacturer measurement.
export const PROFILE_VERSION=1;
const profile=(roughness,metalness,clearcoat,clearcoatRoughness,iridescence=0,iridescenceIOR=1.3,range=[100,400])=>Object.freeze({roughness,metalness,clearcoat,clearcoatRoughness,iridescence,iridescenceIOR,iridescenceThicknessRange:Object.freeze(range)});
export const RENDER_PROFILES=Object.freeze({
 gloss:profile(.19,.05,.85,.12),satin:profile(.46,.03,.18,.3),matte:profile(.78,.01,0,.5),
 metallic:profile(.28,.42,.8,.16),pearlescent:profile(.3,.12,.7,.18,.28,1.34,[240,380]),
 chrome:profile(.1,.96,.12,.08),'color-shift':profile(.27,.3,.7,.16,.9,1.4,[150,550]),
 'iridescent-satin':profile(.46,.25,.18,.3,.85,1.4,[150,550]),
 'iridescent-gloss':profile(.22,.2,.8,.12,.6,1.35,[330,440]),
});
export const CALIBRATION=Object.freeze({status:'unmeasured',author:'Zap Wrap',version:PROFILE_VERSION,referenceLighting:'neutral-studio-v1',sampleReference:null,standardPhotoReference:null});
export function resolvedProfile(config,product){
 const base=RENDER_PROFILES[product?.renderProfile||config.finish]||RENDER_PROFILES.gloss;
 return {...base,iridescence:!product&&config.shift===true? .75:base.iridescence,iridescenceThicknessRange:[...base.iridescenceThicknessRange]};
}
