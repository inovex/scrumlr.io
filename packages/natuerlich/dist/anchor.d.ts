/// <reference types="webxr" resolution-mode="require"/>
import { WebXRManager, Vector3, Quaternion, Camera } from "three";
export declare function getPersistedAnchor(session: XRSession, key: string): Promise<XRAnchor | undefined>;
export declare function createAnchor(camera: Camera, xr: WebXRManager, frame: XRFrame, worldPosition: Vector3, worldRotation: Quaternion): Promise<XRAnchor | undefined>;
export declare function deletePersistedAnchor(session: XRSession, key: string): Promise<undefined>;
export declare function createPersistedAnchor(key: string, camera: Camera, xr: WebXRManager, frame: XRFrame, worldPosition: Vector3, worldRotation: Quaternion): Promise<XRAnchor>;
