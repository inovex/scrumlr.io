/// <reference types="webxr" resolution-mode="require"/>
import { XIntersection } from "@coconut-xr/xinteraction";
import React, { ReactNode } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { ColorRepresentation, Event } from "three";
/**
 * hand for touch objects based on their distance to the index finger
 * includes a cursor visualization that gets more visible based on the distance
 */
export declare function TouchHand({ hand, inputSource, id, children, filterIntersections, cursorSize, cursorVisible, hoverRadius, pressRadius, cursorColor, cursorPressColor, cursorOpacity, cursorOffset, childrenAtJoint, pressSoundUrl, pressSoundVolume, ...rest }: {
    hand: XRHand;
    inputSource: XRInputSource;
    children?: ReactNode;
    id: number;
    filterIntersections?: (intersections: XIntersection[]) => XIntersection[];
    hoverRadius?: number;
    pressRadius?: number;
    cursorColor?: ColorRepresentation;
    cursorPressColor?: ColorRepresentation;
    cursorOpacity?: number;
    cursorSize?: number;
    cursorVisible?: boolean;
    cursorOffset?: number;
    childrenAtJoint?: XRHandJoint;
    onPointerDownMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
    onPointerUpMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
    onClickMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
    pressSoundUrl?: string;
    pressSoundVolume?: number;
}): React.JSX.Element;
