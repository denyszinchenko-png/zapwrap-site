// A fixed local catalog for engineering checks. Never accepts arbitrary paths.
export function localVehicleReview(location) {
  return ['127.0.0.1','localhost','[::1]'].includes(location.hostname)
    && new URLSearchParams(location.search).get('review') === 'first20';
}
export function vehicleCatalogPath(location) {
  return localVehicleReview(location)
    ? '../dev/studio/production/first-20-candidates.json'
    : './data/vehicles.json';
}
