import { useEffect } from "react";
import { useXR } from "./index.js";
/**
 * enters the described webxr session
 * @param options required and optional webxr features and trackedImages
 */
export function useSessionGrant(options) {
    useEffect(() => {
        const xrSystem = navigator.xr;
        if (xrSystem == null) {
            return;
        }
        const listener = async (e) => {
            const session = await xrSystem.requestSession(e.session.mode, options);
            useXR.getState().setSession(session, e.session.mode, options?.trackedImages);
        };
        xrSystem.addEventListener("sessiongranted", listener);
        return () => xrSystem.removeEventListener("sessiongranted", listener);
    }, [options]);
}
