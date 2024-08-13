import { useCallback } from "react";
import { useXR } from "./index.js";
/**
 * @param mode either inline, immersive-vr, or immersive-ar
 * @param options required and optional webxr features and trackedImages
 * @returns a function to enter the described webxr session
 */
export function useEnterXR(mode, options) {
    return useCallback(async () => {
        const xrSystem = navigator.xr;
        if (xrSystem == null) {
            return;
        }
        const session = await xrSystem.requestSession(mode, options);
        useXR.getState().setSession(session, mode, options?.trackedImages);
    }, [mode, options]);
}
