// Explicit, asset-specific metadata selectors. Unmapped geometry remains full-wrap only.
export function mappedPanel(node,material,mapping){
  const matches=Object.entries(mapping?.panels||{}).filter(([,panel])=>panel.selectors.some(selector=>
    material.name===selector.material && Object.entries(selector.metadata).every(([key,value])=>node.userData?.[key]===value)));
  return matches.length===1?matches[0][0]:null;
}
export function availablePanels(root,mapping){
  const counts=new Map();root.traverse(node=>{if(!node.isMesh)return;
    const matched=new Set([].concat(node.material).map(m=>mappedPanel(node,m,mapping)).filter(Boolean));
    matched.forEach(id=>counts.set(id,(counts.get(id)||0)+1));
  });
  return Object.keys(mapping?.panels||{}).filter(id=>counts.get(id)===mapping.panels[id].expectedMeshes);
}
// One material can be shared by several source meshes. Isolate panel assignments.
export function panelMaterialCache(){
  const originals=new Map();
  return {originals, get(original,panel,create){
    if(!originals.has(original))originals.set(original,new Map());
    const variants=originals.get(original),key=panel||'unmapped';
    if(!variants.has(key))variants.set(key,create());
    return variants.get(key);
  }};
}
export function panelIsWrapped(zone,panel,config){
  if(config.wrapTarget!=='full')return zone==='exterior'&&panel===config.wrapTarget;
  return zone==='exterior'||(config.coverage==='extended'&&config.zones.includes(zone));
}
