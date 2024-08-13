/// <reference types="webxr" resolution-mode="require"/>
import { XRTrackedImageInit } from "./index.js";
/**
 * @param mode either inline, immersive-vr, or immersive-ar
 * @param options required and optional webxr features and trackedImages
 * @returns a function to enter the described webxr session
 */
export declare function useEnterXR(mode: XRSessionMode, options?: XRSessionInit & {
    trackedImages?: ReadonlyArray<XRTrackedImageInit>;
}): () => Promise<void>;
