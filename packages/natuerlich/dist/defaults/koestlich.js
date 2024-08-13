/* eslint-disable react/display-name */
import React, { forwardRef, useImperativeHandle, useRef, useEffect, useLayoutEffect, } from "react";
import { CylinderLayerPortal, QuadLayerPortal } from "../react/index.js";
import { RootContainer } from "@coconut-xr/koestlich";
import { useStore } from "@react-three/fiber";
/**
 * combines WebXR quad layer with a Koestlich root container
 */
export const KoestlichQuadLayer = forwardRef(({ children, far, near, precision, ...props }, ref) => {
    return (React.createElement(QuadLayerPortal, { ...props, ref: ref },
        React.createElement(KoestlichFullscreenCamera, { width: props.pixelWidth, height: props.pixelHeight, far: far, near: near }),
        React.createElement(RootContainer, { sizeX: props.pixelWidth, sizeY: props.pixelHeight, pixelSize: 1, precision: precision }, children)));
});
/**
 * combines WebXR cylinder layer with a Koestlich root container
 */
export const KoestlichCylinderLayer = forwardRef(({ children, far, near, precision, ...props }, ref) => {
    return (React.createElement(CylinderLayerPortal, { ...props, ref: ref },
        React.createElement(KoestlichFullscreenCamera, { width: props.pixelWidth, height: props.pixelHeight, far: far, near: near }),
        React.createElement(RootContainer, { sizeX: props.pixelWidth, sizeY: props.pixelHeight, pixelSize: 1, precision: precision }, children)));
});
/**
 * expects the Koestlich container to be at 0,0,0 with anchor center
 */
export const KoestlichFullscreenCamera = forwardRef(({ near = 100, far = -1, zoom = 1, width, height }, ref) => {
    const store = useStore();
    const internalRef = useRef(null);
    useImperativeHandle(ref, () => internalRef.current, []);
    useEffect(() => {
        const newCamera = internalRef.current;
        if (newCamera == null) {
            return;
        }
        const prevCamera = store.getState().camera;
        store.setState({ camera: newCamera });
        return () => {
            if (store.getState().camera != newCamera) {
                //camera was already changed to another one
                return;
            }
            store.setState({ camera: prevCamera });
        };
    }, [store]);
    useLayoutEffect(() => internalRef.current?.updateProjectionMatrix(), [zoom, near, far]);
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    //the camera automatically retrieves the width and height and positions itself and the view bounds accordingly
    return (React.createElement("orthographicCamera", { position: [0, 0, near], left: -halfWidth, right: halfWidth, top: halfHeight, bottom: -halfHeight, zoom: zoom, near: 0, far: near - far, ref: internalRef }));
});
