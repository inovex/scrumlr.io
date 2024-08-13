import {XSphereCollider} from "@coconut-xr/xinteraction/react";
import React, {Suspense, useMemo, useRef} from "react";
import {DynamicHandModel, HandBoneGroup} from "../react/hand.js";
import {useInputSourceEvent} from "../react/listeners.js";
import {CursorBasicMaterial, updateColor, updateCursorDistanceOpacity, updateCursorTransformation, PositionalAudio} from "./index.js";
import {createPortal, useThree} from "@react-three/fiber";
import {FocusStateGuard} from "../react/index.js";
import plop from "../assets/plop.mp3";
/**
 * hand for grabbing objects when the pinch gesture is detected
 * includes hover effects
 */
export function GrabHand({
  hand,
  inputSource,
  id,
  children,
  filterIntersections,
  cursorColor = "black",
  cursorOpacity = 0.5,
  cursorPressColor = "white",
  cursorSize = 0.1,
  cursorVisible = true,
  radius = 0.07,
  cursorOffset = 0.01,
  childrenAtJoint = "wrist",
  pressSoundUrl = plop,
  pressSoundVolume = 0.3,
  ...rest
}) {
  const sound = useRef(null);
  const colliderRef = useRef(null);
  const distanceRef = useRef(Infinity);
  const pressedRef = useRef(false);
  const cursorRef = useRef(null);
  const cursorMaterial = useMemo(() => new CursorBasicMaterial({transparent: true, toneMapped: false}), []);
  useInputSourceEvent(
    "selectstart",
    inputSource,
    (e) => {
      if (cursorRef.current?.visible && sound.current != null) {
        sound.current.play();
      }
      pressedRef.current = true;
      updateColor(pressedRef.current, cursorMaterial, cursorColor, cursorPressColor);
      colliderRef.current?.press(0, e);
    },
    []
  );
  useInputSourceEvent(
    "selectend",
    inputSource,
    (e) => {
      pressedRef.current = false;
      updateColor(pressedRef.current, cursorMaterial, cursorColor, cursorPressColor);
      colliderRef.current?.release(0, e);
    },
    []
  );
  updateColor(pressedRef.current, cursorMaterial, cursorColor, cursorPressColor);
  updateCursorDistanceOpacity(cursorMaterial, distanceRef.current, radius / 2, radius, cursorOpacity);
  const scene = useThree(({scene}) => scene);
  return React.createElement(
    FocusStateGuard,
    null,
    React.createElement(
      Suspense,
      {fallback: null},
      React.createElement(
        DynamicHandModel,
        {hand: hand, handedness: inputSource.handedness},
        React.createElement(
          HandBoneGroup,
          {rotationJoint: "wrist", joint: ["thumb-tip", "index-finger-tip"]},
          React.createElement(XSphereCollider, {
            ref: colliderRef,
            radius: radius,
            id: id,
            filterIntersections: filterIntersections,
            onIntersections: (intersections) => {
              updateCursorTransformation(inputSource, intersections, cursorRef, cursorOffset);
              if (intersections.length === 0) {
                return;
              }
              distanceRef.current = intersections[0].distance;
              updateCursorDistanceOpacity(cursorMaterial, distanceRef.current, radius / 2, radius, cursorOpacity);
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
