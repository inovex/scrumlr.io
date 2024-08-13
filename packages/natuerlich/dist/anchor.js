import { Vector3, Quaternion } from "three";
import { useXR } from "./react/state.js";
export async function getPersistedAnchor(session, key) {
    const anchorId = await localStorage.getItem(key);
    if (anchorId == null) {
        return undefined;
    }
    if (session == null || !("restorePersistentAnchor" in session)) {
        return Promise.reject(new Error(`session unavailable or restorePersistentAnchor not available`));
    }
    return session.restorePersistentAnchor(anchorId);
}
const positonHelper = new Vector3();
const quaternionHelper = new Quaternion();
export async function createAnchor(camera, xr, frame, worldPosition, worldRotation) {
    const session = useXR.getState().session;
    const referenceSpace = xr.getReferenceSpace();
    if (session == null || frame == null || referenceSpace == null) {
        return Promise.reject(new Error(`create anchor failed. session, frame, reference space, or createAnchor unavailable`));
    }
    if (camera.parent != null) {
        camera.parent.getWorldPosition(positonHelper).negate().add(worldPosition);
        camera.parent.getWorldQuaternion(quaternionHelper).invert().multiply(worldRotation);
    }
    else {
        positonHelper.copy(worldPosition);
        quaternionHelper.copy(worldRotation);
    }
    return await frame.createAnchor?.(new XRRigidTransform({
        x: positonHelper.x,
        y: positonHelper.y,
        z: positonHelper.z,
    }, {
        x: quaternionHelper.x,
        y: quaternionHelper.y,
        z: quaternionHelper.z,
        w: quaternionHelper.w,
    }), referenceSpace);
}
export async function deletePersistedAnchor(session, key) {
    const anchorId = await localStorage.getItem(key);
    if (anchorId == null) {
        return undefined;
    }
    if (session == null || !("deletePersistentAnchor" in session)) {
        return Promise.reject(new Error(`session unavailable or deletePersistentAnchor not available`));
    }
    return session.deletePersistentAnchor(anchorId);
}
export async function createPersistedAnchor(key, camera, xr, frame, worldPosition, worldRotation) {
    const anchor = await createAnchor(camera, xr, frame, worldPosition, worldRotation);
    if (anchor == null || !("requestPersistentHandle" in anchor)) {
        return Promise.reject(new Error(`create persisted anchor failed. createAnchor failed or requestPersistentHandle unavailable`));
    }
    const anchorHandle = await anchor.requestPersistentHandle();
    localStorage.setItem(key, anchorHandle);
    return anchor;
}
