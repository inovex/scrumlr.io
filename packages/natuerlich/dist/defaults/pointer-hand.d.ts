/// <reference types="webxr" resolution-mode="require"/>
import { XIntersection } from "@coconut-xr/xinteraction";
import React, { ReactNode } from "react";
import { ColorRepresentation, Event } from "three";
import { ThreeEvent } from "@react-three/fiber";
/**
 * hand for pointing objects when the pinch gesture is detected
 * includes a cursor and ray visualization
 */
export declare function PointerHand({ hand, inputSource, id, children, filterIntersections, cursorColor, cursorPressColor, cursorOpacity, cursorSize, cursorVisible, rayColor, rayPressColor, rayMaxLength, rayVisibile, raySize, cursorOffset, childrenAtJoint, pressSoundUrl, pressSoundVolume, ...rest }: {
    hand: XRHand;
    inputSource: XRInputSource;
    children?: ReactNode;
    id: number;
    cursorColor?: ColorRepresentation;
    cursorPressColor?: ColorRepresentation;
    cursorOpacity?: number;
    cursorSize?: number;
    cursorVisible?: boolean;
    rayColor?: ColorRepresentation;
    rayPressColor?: ColorRepresentation;
    rayMaxLength?: number;
    rayVisibile?: boolean;
    raySize?: number;
    filterIntersections?: (intersections: XIntersection[]) => XIntersection[];
    cursorOffset?: number;
    childrenAtJoint?: XRHandJoint;
    onPointerDownMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
    onPointerUpMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
    onClickMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
    pressSoundUrl?: string;
    pressSoundVolume?: number;
}): React.JSX.Element;
