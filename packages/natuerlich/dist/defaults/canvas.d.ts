import { XWebPointers } from "@coconut-xr/xinteraction/react";
import { CanvasProps } from "@react-three/fiber";
import React, { ComponentProps } from "react";
import { XRProps } from "../react/index.js";
/**
 * basic component for creating a webxr scene
 */
export declare function XRCanvas({ foveation, frameRate, referenceSpace, frameBufferScaling, filterClipped, filterIntersections, onClickMissed, onIntersections, onPointerDownMissed, onPointerUpMissed, dragDistance, children, ...props }: CanvasProps & XRProps & ComponentProps<typeof XWebPointers>): React.JSX.Element;
