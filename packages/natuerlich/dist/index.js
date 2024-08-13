export const DEFAULT_PROFILES_PATH = "https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles";
const xrPlaneIdMap = new Map();
export function getPlaneId(plane) {
    let id = xrPlaneIdMap.get(plane);
    if (id == null) {
        xrPlaneIdMap.set(plane, (id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)));
    }
    return id;
}
const xrMeshIdMap = new Map();
export function getMeshId(mesh) {
    let id = xrMeshIdMap.get(mesh);
    if (id == null) {
        xrMeshIdMap.set(mesh, (id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)));
    }
    return id;
}
const xrInputSourceIdMap = new Map();
export function getInputSourceId(inputSource) {
    let id = xrInputSourceIdMap.get(inputSource);
    if (id == null) {
        xrInputSourceIdMap.set(inputSource, (id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)));
    }
    return id;
}
export * from "./motion-hand.js";
export * from "./motion-controller.js";
export * from "./anchor.js";
export * from "./pose.js";
