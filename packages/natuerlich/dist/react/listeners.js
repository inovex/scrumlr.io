import { useEffect } from "react";
import { useXR } from "./index.js";
import { shallow } from "zustand/shallow";
import { getInputSourceId } from "../index.js";
/**
 * @param onSessionChange callback executed when the session changes containing the current and old webxr session
 * @param deps the dependencies that make the onSessionChange change
 */
export function useSessionChange(onSessionChange, deps) {
    useEffect(() => {
        //start
        onSessionChange(useXR.getState().session, undefined);
        const callback = useXR.subscribe((state, prevState) => {
            if (prevState.session === state.session) {
                return;
            }
            //update
            onSessionChange(state.session, prevState.session);
        });
        return () => {
            callback();
            //end
            onSessionChange(undefined, useXR.getState().session);
        };
    }, deps);
}
/**
 *
 * @param onXRInputSourcesChange callback executed when the input sources change
 * @param deps the dependencies that make the onXRInputSourcesChange change
 */
export function useInputSourceChange(onXRInputSourcesChange, deps) {
    useSessionChange((session, prevSession) => {
        if (prevSession != null) {
            prevSession.removeEventListener("inputsourceschange", onXRInputSourcesChange);
        }
        if (session != null) {
            session.addEventListener("inputsourceschange", onXRInputSourcesChange);
        }
    }, deps);
}
/**
 * @param callback function that gets called when the specified event happens
 * @param deps the dependencies that make the callback change
 */
export function useInputSourceEvent(name, inputSource, callback, deps) {
    const session = useXR((state) => state.session);
    useEffect(() => {
        if (session == null) {
            return;
        }
        const pointerId = getInputSourceId(inputSource);
        const listener = (e) => {
            if (e.inputSource != inputSource) {
                return;
            }
            e.pointerId = pointerId;
            callback(e);
        };
        session.addEventListener(name, listener);
        return () => {
            session.removeEventListener(name, listener);
        };
    }, [session, name, inputSource, ...deps]);
}
/**
 * @returns the currently active input sources
 */
export function useInputSources() {
    return useXR((state) => (state.inputSources != null ? Array.from(state.inputSources.values()) : []), shallow);
}
