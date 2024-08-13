import {XStraightPointer} from "@coconut-xr/xinteraction/react";
import React, {Suspense, useRef, useMemo} from "react";
import {DynamicHandModel, HandBoneGroup} from "../react/hand.js";
import {useInputSourceEvent} from "../react/listeners.js";
import {SpaceGroup} from "../react/space.js";
import {Vector3} from "three";
import {CursorBasicMaterial, PositionalAudio, RayBasicMaterial, updateColor, updateCursorTransformation, updateRayTransformation} from "./index.js";
import {createPortal, useThree} from "@react-three/fiber";
import {FocusStateGuard} from "../react/index.js";
import plop from "../assets/plop.mp3";

const negZAxis = new Vector3(0, 0, -1);
/**
 * hand for pointing objects when the pinch gesture is detected
 * includes a cursor and ray visualization
 */
export function PointerHand({
  hand,
  inputSource,
  id,
  children,
  filterIntersections,
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
  childrenAtJoint = "wrist",
  pressSoundUrl = plop,
  pressSoundVolume = 0.3,
  ...rest
}) {
  const sound = useRef(null);
  const pointerRef = useRef(null);
  const pressedRef = useRef(false);
  const cursorRef = useRef(null);
  const rayRef = useRef(null);
  const cursorMaterial = useMemo(() => new CursorBasicMaterial({transparent: true, toneMapped: false}), []);
  cursorMaterial.opacity = cursorOpacity;
  updateColor(pressedRef.current, cursorMaterial, cursorColor, cursorPressColor);
  const rayMaterial = useMemo(() => new RayBasicMaterial({transparent: true, toneMapped: false}), []);
  updateColor(pressedRef.current, rayMaterial, rayColor, rayPressColor);
  useInputSourceEvent(
    "selectstart",
    inputSource,
    (e) => {
      if (cursorRef.current?.visible && sound.current != null) {
        sound.current.play();
      }
      pressedRef.current = true;
      updateColor(pressedRef.current, rayMaterial, rayColor, rayPressColor);
      updateColor(pressedRef.current, cursorMaterial, cursorColor, cursorPressColor);
      pointerRef.current?.press(0, e);
    },
    []
  );
  useInputSourceEvent(
    "selectend",
    inputSource,
    (e) => {
      pressedRef.current = false;
      updateColor(pressedRef.current, rayMaterial, rayColor, rayPressColor);
      updateColor(pressedRef.current, cursorMaterial, cursorColor, cursorPressColor);
      pointerRef.current?.release(0, e);
    },
    []
  );
  const scene = useThree(({scene}) => scene);
  return React.createElement(
    FocusStateGuard,
    null,
    React.createElement(
      Suspense,
      null,
      React.createElement(
        DynamicHandModel,
        {hand: hand, handedness: inputSource.handedness},
        children != null && React.createElement(HandBoneGroup, {joint: childrenAtJoint}, children)
      )
    ),
    React.createElement(
      SpaceGroup,
      {space: inputSource.targetRaySpace},
      React.createElement(XStraightPointer, {
        onIntersections: (intersections) => {
          if (cursorVisible) {
            updateCursorTransformation(inputSource, intersections, cursorRef, cursorOffset);
          }
          if (rayVisibile) {
            updateRayTransformation(intersections, rayMaxLength, rayRef);
          }
        },
        direction: negZAxis,
        filterIntersections: filterIntersections,
        id: id,
        ref: pointerRef,
        ...rest,
      }),
      React.createElement(
        "mesh",
        {visible: rayVisibile, "scale-x": raySize, "scale-y": raySize, material: rayMaterial, ref: rayRef, renderOrder: inputSource.handedness === "left" ? 3 : 4},
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
