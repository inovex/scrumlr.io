import {XSphereCollider} from "@coconut-xr/xinteraction/react";
import React, {useRef, useMemo, Suspense} from "react";
import {DynamicControllerModel} from "../react/controller.js";
import {FocusStateGuard, useInputSourceEvent} from "../react/index.js";
import {SpaceGroup} from "../react/space.js";
import {CursorBasicMaterial, updateCursorTransformation, updateColor, updateCursorDistanceOpacity, triggerVibration, PositionalAudio} from "./index.js";
import {createPortal, useThree} from "@react-three/fiber";
import plop from "../assets/plop.mp3";
/**
 * controller for grabbing objects when the squeeze button is pressed
 * includes hover effects
 */
export function GrabController({
  inputSource,
  children,
  filterIntersections,
  id,
  cursorColor = "black",
  cursorOpacity = 0.5,
  cursorPressColor = "white",
  cursorSize = 0.1,
  cursorVisible = true,
  radius = 0.07,
  cursorOffset = 0.01,
  pressSoundUrl = plop,
  pressSoundVolume = 0.3,
  ...rest
}) {
  const sound = useRef(null);
  const colliderRef = useRef(null);
  const distanceRef = useRef(Infinity);
  const pressedRef = useRef(false);
  const prevIntersected = useRef(false);
  useInputSourceEvent(
    "squeezestart",
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
    "squeezeend",
    inputSource,
    (e) => {
      pressedRef.current = false;
      updateColor(pressedRef.current, cursorMaterial, cursorColor, cursorPressColor);
      colliderRef.current?.release(0, e);
    },
    []
  );
  const cursorRef = useRef(null);
  const cursorMaterial = useMemo(() => new CursorBasicMaterial({transparent: true, toneMapped: false}), []);
  updateColor(pressedRef.current, cursorMaterial, cursorColor, cursorPressColor);
  updateCursorDistanceOpacity(cursorMaterial, distanceRef.current, radius / 2, radius, cursorOpacity);
  const scene = useThree(({scene}) => scene);
  if (inputSource.gripSpace == null) {
    return null;
  }
  return React.createElement(
    FocusStateGuard,
    null,
    React.createElement(
      SpaceGroup,
      {space: inputSource.gripSpace},
      React.createElement(XSphereCollider, {
        id: id,
        filterIntersections: filterIntersections,
        onIntersections: (intersections) => {
          updateCursorTransformation(inputSource, intersections, cursorRef, cursorOffset);
          triggerVibration(intersections, inputSource, prevIntersected);
          if (intersections.length === 0) {
            return;
          }
          distanceRef.current = intersections[0].distance;
          updateCursorDistanceOpacity(cursorMaterial, distanceRef.current, radius / 2, radius, cursorOpacity);
        },
        ref: colliderRef,
        radius: radius,
        ...rest,
      }),
      children,
      React.createElement(Suspense, {fallback: null}, React.createElement(DynamicControllerModel, {inputSource: inputSource}))
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
