/* eslint-disable react/display-name */
import { useStore } from "@react-three/fiber";
import React, { useEffect, useImperativeHandle, useRef } from "react";
import { forwardRef } from "react";
import { useXR } from "./state.js";
const manualCameraProp = { manual: true };
/**
 * component to position and rotate the camera when not in immersive mode
 */
export const NonImmersiveCamera = forwardRef((props, ref) => {
    const store = useStore();
    const internalRef = useRef(null);
    useImperativeHandle(ref, () => internalRef.current, []);
    const enabled = useXR(({ mode }) => mode === "none");
    useEffect(() => {
        if (!enabled) {
            return;
        }
        const newCamera = internalRef.current;
        if (newCamera == null) {
            return;
        }
        const prevCamera = store.getState().camera;
        store.setState({ camera: newCamera });
        //aspect ratio
        const unsubscribe = store.subscribe((state, prevState) => {
            if (state.size.width === prevState.size.width &&
                state.size.height === prevState.size.height) {
                return;
            }
            newCamera.aspect = state.size.width / state.size.height;
            newCamera.updateProjectionMatrix();
        });
        const { size } = store.getState();
        newCamera.aspect = size.width / size.height;
        newCamera.updateProjectionMatrix();
        return () => {
            unsubscribe();
            if (store.getState().camera != newCamera) {
                //camera was already changed to another one
                return;
            }
            store.setState({ camera: prevCamera });
        };
    }, [store, enabled]);
    if (!enabled) {
        return null;
    }
    return React.createElement("perspectiveCamera", { ...manualCameraProp, ref: internalRef, ...props });
});
