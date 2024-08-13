import { XWebPointers, noEvents } from "@coconut-xr/xinteraction/react";
import { Canvas } from "@react-three/fiber";
import React from "react";
import { XR } from "../react/index.js";
/**
 * basic component for creating a webxr scene
 */
export function XRCanvas({ foveation, frameRate, referenceSpace, frameBufferScaling, filterClipped, filterIntersections, onClickMissed, onIntersections, onPointerDownMissed, onPointerUpMissed, dragDistance, children, ...props }) {
    return (React.createElement(Canvas, { ...props, events: noEvents },
        React.createElement(XR, { foveation: foveation, frameBufferScaling: frameBufferScaling, frameRate: frameRate, referenceSpace: referenceSpace }),
        React.createElement(XWebPointers, { filterClipped: filterClipped, filterIntersections: filterIntersections, onClickMissed: onClickMissed, onIntersections: onIntersections, onPointerDownMissed: onPointerDownMissed, onPointerUpMissed: onPointerUpMissed, dragDistance: dragDistance }),
        children));
}
