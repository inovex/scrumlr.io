/// <reference types="webxr" resolution-mode="require"/>
export * from "./use-enter-xr.js";
export * from "./use-session-grant.js";
export * from "./space.js";
export * from "./guards/index.js";
export * from "./listeners.js";
export * from "./controller.js";
export * from "./hand.js";
export * from "./state.js";
export * from "./anchor.js";
export * from "./session-origin.js";
export * from "./anchor.js";
export * from "./camera.js";
export * from "./layers/index.js";
export * from "./plane.js";
export * from "./mesh.js";
export * from "./image.js";
export * from "./background.js";
export * from "./pose.js";
export * from "./gamepad.js";
/**
 * hook to determine if a xr mode is supported
 * @param mode the xr mode to request for support
 * @returns undefined while requesting support and a boolean once the support state is clear
 */
export declare function useSessionSupported(mode: XRSessionMode): boolean | undefined;
/**
 *
 * @returns the focus state of the xr session; returns undefined if not in a xr session
 */
export declare function useFocusState(): XRVisibilityState | undefined;
/**
 * @returns the native frame buffer scaling
 */
export declare function useNativeFramebufferScaling(): number | undefined;
/**
 * @returns a array of possible frame rates
 */
export declare function useAvailableFrameRates(): Float32Array | undefined;
/**
 * @returns the highest available framerate
 */
export declare function useHeighestAvailableFrameRate(): number | undefined;
export type XRProps = {
    foveation?: number;
    frameRate?: number;
    referenceSpace?: XRReferenceSpaceType;
    frameBufferScaling?: number;
};
/**
 * component for adding webxr support to a scene
 * must be positioned somewhere inside the canvas
 * only one XR component can be present in a scene
 */
export declare function XR({ foveation, frameRate, referenceSpace, frameBufferScaling, }: XRProps): null;
