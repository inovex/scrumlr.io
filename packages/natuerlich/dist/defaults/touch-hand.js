import {XSphereCollider} from "@coconut-xr/xinteraction/react";
import React, {Suspense, useMemo, useRef} from "react";
import {DynamicHandModel, HandBoneGroup} from "../react/hand.js";
import {createPortal, useThree} from "@react-three/fiber";
import {CursorBasicMaterial, updateCursorDistanceOpacity, updateCursorTransformation, PositionalAudio} from "./index.js";
import {FocusStateGuard} from "../react/index.js";
import plop from "../assets/plop.mp3";
/**
 * hand for touch objects based on their distance to the index finger
 * includes a cursor visualization that gets more visible based on the distance
 */
export function TouchHand({
  hand,
  inputSource,
  id,
  children,
  filterIntersections,
  cursorSize = 0.1,
  cursorVisible = true,
  hoverRadius = 0.1,
  pressRadius = 0.03,
  cursorColor = "black",
  cursorPressColor = "white",
  cursorOpacity = 0.5,
  cursorOffset = 0.01,
  childrenAtJoint = "wrist",
  pressSoundUrl = plop,
  pressSoundVolume = 0.3,
  ...rest
}) {
  const sound = useRef(null);
  const scene = useThree(({scene}) => scene);
  const distanceRef = useRef(Infinity);
  const wasPressedRef = useRef(false);
  const cursorRef = useRef(null);
  const cursorMaterial = useMemo(() => new CursorBasicMaterial({transparent: true, toneMapped: false}), []);
  wasPressedRef.current = updateCursorAppearance(
    distanceRef.current,
    cursorMaterial,
    cursorColor,
    cursorPressColor,
    cursorOpacity,
    wasPressedRef.current,
    () => sound.current?.play(),
    hoverRadius,
    pressRadius
  );
  return React.createElement(
    FocusStateGuard,
    null,
    React.createElement(
      Suspense,
      null,
      React.createElement(
        DynamicHandModel,
        {hand: hand, handedness: inputSource.handedness},
        React.createElement(
          HandBoneGroup,
          {joint: "index-finger-tip"},
          React.createElement(XSphereCollider, {
            radius: hoverRadius,
            distanceElement: {id: 0, downRadius: pressRadius},
            id: id,
            filterIntersections: filterIntersections,
            onIntersections: (intersections) => {
              updateCursorTransformation(inputSource, intersections, cursorRef, cursorOffset);
              if (intersections.length === 0) {
                return;
              }
              distanceRef.current = intersections[0].distance;
              wasPressedRef.current = updateCursorAppearance(
                distanceRef.current,
                cursorMaterial,
                cursorColor,
                cursorPressColor,
                cursorOpacity,
                wasPressedRef.current,
                () => sound.current?.play(),
                hoverRadius,
                pressRadius
              );
            },
            ...rest,
          })
        ),
        children != null && React.createElement(HandBoneGroup, {joint: childrenAtJoint}, children)
      )
    ),
    createPortal(
      React.createElement(
        "mesh",
        {renderOrder: inputSource.handedness === "left" ? 1 : 2, visible: cursorVisible, scale: cursorSize, ref: cursorRef, material: cursorMaterial},
        React.createElement(Suspense, null, React.createElement(PositionalAudio, {url: pressSoundUrl, volume: pressSoundVolume, ref: sound})),
        React.createElement("planeGeometry", null)
      ),
      scene
    )
  );
}
function updateCursorAppearance(distance, material, cursorColor, cursorPressColor, cursorOpacity, wasPressed, onPress, hoverRadius, pressRadius) {
  if (pressRadius != null && distance < pressRadius) {
    material.color.set(cursorPressColor);
    material.opacity = cursorOpacity;
    if (!wasPressed) {
      onPress();
    }
    return true;
  }
  updateCursorDistanceOpacity(material, distance, pressRadius ?? 0, hoverRadius, cursorOpacity);
  material.color.set(cursorColor);
  return false;
}
