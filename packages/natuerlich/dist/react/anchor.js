import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useXR } from "./index.js";
import { createAnchor, createPersistedAnchor, deletePersistedAnchor, getPersistedAnchor, } from "../anchor.js";
/**
 * stores and creates a anchor similar to useState
 * @returns a tuple containing the anchor and a function to create a new anchor
 */
export function useAnchor() {
    const [anchor, setAnchor] = useState(undefined);
    const destroyed = useRef(false);
    const create = useCallback(async (worldPosition, worldRotation) => void useXR.getState().onNextFrameCallbacks.add(async (state, _delta, frame) => {
        if (frame == null || destroyed.current) {
            return;
        }
        const anchor = await createAnchor(state.camera, state.gl.xr, frame, worldPosition, worldRotation);
        if (anchor == null || destroyed.current) {
            return;
        }
        setAnchor(anchor);
    }), []);
    useEffect(() => () => {
        //cleanup => prevents setAnchor
        destroyed.current = true;
    }, []);
    return [anchor, create];
}
/**
 * stores and creates an anchor that is persisted in the local storage
 * @param key the key that is used to store and load the anchor id
 * @returns a tuple containing the anchor and a function to create a new anchor
 */
export function usePersistedAnchor(key) {
    const session = useXR(({ session }) => session);
    const [anchor, setAnchor] = useState(undefined);
    const state = useMemo(() => ({ destroyed: false, session, key }), [session, key]);
    useEffect(() => {
        setAnchor(undefined);
        if (state.session == null) {
            return;
        }
        getPersistedAnchor(state.session, state.key)
            .then((anchor) => {
            if (state.destroyed) {
                return;
            }
            setAnchor(anchor);
        })
            .catch((error) => {
            if (state.destroyed) {
                return;
            }
            console.error(error);
            setAnchor(undefined);
        });
        return () => {
            state.destroyed = true;
        };
    }, [state]);
    const create = useCallback(async (worldPosition, worldRotation) => void useXR.getState().onNextFrameCallbacks.add(async (rootState, _delta, frame) => {
        if (frame == null || state.session == null || state.destroyed) {
            return;
        }
        //cleanup prev anchor
        deletePersistedAnchor(state.session, state.key);
        //make new anchor
        const anchor = await createPersistedAnchor(state.key, rootState.camera, rootState.gl.xr, frame, worldPosition, worldRotation);
        if (anchor == null || state.destroyed) {
            return;
        }
        setAnchor(anchor);
    }), [state]);
    return [anchor, create];
}
