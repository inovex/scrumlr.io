import {Suspense, useMemo, useRef} from "react";
import {XStraightPointer} from "@coconut-xr/xinteraction/react";
import {useInputSourceEvent} from "../react/listeners.js";
import React from "react";
import {SpaceGroup} from "../react/space.js";
import {DynamicControllerModel} from "../react/controller.js";
import {Vector3, Vector2} from "three";
import {
  CursorBasicMaterial,
  RayBasicMaterial,
  triggerVibration,
  updateColor as updatePointerColor,
  updateCursorTransformation,
  updateRayTransformation,
  PositionalAudio,
  isTouchscreen,
} from "./index.js";
import {createPortal, useFrame, useThree} from "@react-three/fiber";
import {FocusStateGuard, useXRGamepadReader} from "../react/index.js";
import plop from "../assets/plop.mp3";

const negZAxis = new Vector3(0, 0, -1);
const vec2Helper = new Vector2();
/**
 * controller for pointing objects when the select button is pressed
 * includes a cursor and ray visualization
 */
export function PointerController({
  inputSource,
  children,
  filterIntersections,
  id,
  cursorColor = "white",
  cursorPressColor = "blue",
  cursorOpacity = 0.5,
  cursorSize = 0.1,
  cursorVisible = true,
  rayColor = "white",
  rayPressColor = "blue",
  rayMaxLength = 1,
  rayVisibile = true,
  raySize = 0.005,
  cursorOffset = 0.01,
  pressSoundUrl = plop,
  pressSoundVolume = 0.3,
  scrollSpeed,
  ...rest
}) {
  const sound = useRef(null);
  const touchscreen = isTouchscreen(inputSource);
  const pointerRef = useRef(null);
  const pressedRef = useRef(false);
  const cursorRef = useRef(null);
  const rayRef = useRef(null);
  const prevIntersected = useRef(false);
  const reader = useXRGamepadReader(inputSource);
  useFrame((_, delta) => {
    if (scrollSpeed === null || pointerRef.current == null || !reader.readAxes("xr-standard-thumbstick", vec2Helper)) {
      return;
    }
    const speed = scrollSpeed ?? 300;
    const event = new WheelEvent("wheel", {
      deltaX: vec2Helper.x * delta * speed,
      deltaY: vec2Helper.y * delta * speed,
    });
    pointerRef.current.wheel(event);
  });
  const cursorMaterial = useMemo(() => new CursorBasicMaterial({transparent: true, toneMapped: false}), []);
  cursorMaterial.opacity = cursorOpacity;
  updatePointerColor(pressedRef.current || touchscreen, cursorMaterial, cursorColor, cursorPressColor);
  const rayMaterial = useMemo(() => new RayBasicMaterial({transparent: true, toneMapped: false}), []);
  updatePointerColor(pressedRef.current, rayMaterial, rayColor, rayPressColor);
  useInputSourceEvent(
    "selectstart",
    inputSource,
    (e) => {
      if (cursorRef.current?.visible && sound.current != null) {
        sound.current.play();
      }
      pressedRef.current = true;
      updatePointerColor(pressedRef.current || touchscreen, cursorMaterial, cursorColor, cursorPressColor);
      updatePointerColor(pressedRef.current, rayMaterial, rayColor, rayPressColor);
      pointerRef.current?.press(0, e);
    },
    []
  );
  useInputSourceEvent(
    "selectend",
    inputSource,
    (e) => {
      pressedRef.current = false;
      updatePointerColor(pressedRef.current, cursorMaterial, cursorColor, cursorPressColor);
      updatePointerColor(pressedRef.current, rayMaterial, rayColor, rayPressColor);
      pointerRef.current?.release(0, e);
    },
    []
  );
  const scene = useThree(({scene}) => scene);
  return React.createElement(
    FocusStateGuard,
    null,
    inputSource.gripSpace != null &&
      React.createElement(
        SpaceGroup,
        {space: inputSource.gripSpace},
        children,
        React.createElement(Suspense, {fallback: null}, React.createElement(DynamicControllerModel, {inputSource: inputSource}))
      ),
    React.createElement(
      SpaceGroup,
      {space: inputSource.targetRaySpace},
      React.createElement(XStraightPointer, {
        onIntersections: (intersections) => {
          updateCursorTransformation(inputSource, intersections, cursorRef, cursorOffset);
          updateRayTransformation(intersections, rayMaxLength, rayRef);
          triggerVibration(intersections, inputSource, prevIntersected);
        },
        initialPressedElementIds: touchscreen ? [0] : undefined,
        id: id,
        direction: negZAxis,
        ref: pointerRef,
        filterIntersections: filterIntersections,
        ...rest,
      }),
      React.createElement(
        "mesh",
        {visible: rayVisibile && !touchscreen, "scale-x": raySize, "scale-y": raySize, material: rayMaterial, ref: rayRef, renderOrder: inputSource.handedness === "left" ? 3 : 4},
        React.createElement("boxGeometry", null)
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
