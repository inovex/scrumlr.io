/// <reference types="webxr" resolution-mode="require"/>
export declare const DEFAULT_PROFILES_PATH = "https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles";
export declare function getPlaneId(plane: XRPlane): number;
export declare function getMeshId(mesh: XRMesh): number;
export declare function getInputSourceId(inputSource: XRInputSource): number;
export * from "./motion-hand.js";
export * from "./motion-controller.js";
export * from "./anchor.js";
export * from "./pose.js";
