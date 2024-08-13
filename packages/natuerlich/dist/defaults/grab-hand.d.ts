/// <reference types="webxr" resolution-mode="require"/>
import { XIntersection } from "@coconut-xr/xinteraction";
import React, { ReactNode } from "react";
import { ColorRepresentation, Event } from "three";
import { ThreeEvent } from "@react-three/fiber";
/**
 * hand for grabbing objects when the pinch gesture is detected
 * includes hover effects
 */
export declare function GrabHand({ hand, inputSource, id, children, filterIntersections, cursorColor, cursorOpacity, cursorPressColor, cursorSize, cursorVisible, radius, cursorOffset, childrenAtJoint, pressSoundUrl, pressSoundVolume, ...rest }: {
    hand: XRHand;
    inputSource: XRInputSource;
    children?: ReactNode;
    id: number;
    filterIntersections?: (intersections: XIntersection[]) => XIntersection[];
    cursorColor?: ColorRepresentation;
    cursorPressColor?: ColorRepresentation;
    cursorOpacity?: number;
    cursorSize?: number;
    cursorVisible?: boolean;
    radius?: number;
    cursorOffset?: number;
    childrenAtJoint?: XRHandJoint;
    onPointerDownMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
    onPointerUpMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
    onClickMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
    pressSoundUrl?: string;
    pressSoundVolume?: number;
}): React.JSX.Element;
