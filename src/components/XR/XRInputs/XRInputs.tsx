import {ImmersiveSessionOrigin, useInputSources, useXR} from "@coconut-xr/natuerlich/react";
import {Controllers} from "@coconut-xr/natuerlich/defaults";
import {useEffect, useRef, useState} from "react";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {REACTION_DEBOUNCE_TIME} from "components/BoardReactionMenu/BoardReactionMenu";
import {useDelayedReset} from "utils/hooks/useDelayedReset";
import {useFrame} from "@react-three/fiber";
import {Matrix4, Quaternion, Vector3} from "three";
import PoseHand from "../XRUI/PoseHand/PoseHand";

const xrInputSourceIdMap = new Map<XRInputSource, number>();

export function getInputSourceId(inputSource: XRInputSource): number {
  let id = xrInputSourceIdMap.get(inputSource);
  if (id == null) {
    xrInputSourceIdMap.set(inputSource, (id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)));
  }
  return id;
}

const thumbForward = new Vector3(0, 0, -1);
const quaternion = new Quaternion();
const worldUp = new Vector3(0, 1, 0);
const matrix = new Matrix4();

const XRInputs = () => {
  const {session} = useXR();
  const inputSources = useInputSources();
  const [leftPoseName, setLeftPoseName] = useState("none");
  const [rightPoseName, setRightPoseName] = useState("none");
  const leftThumb = useRef<"up" | "down" | undefined>();
  const rightThumb = useRef<"up" | "down" | undefined>();

  const dispatch = useDispatch();

  const [debounce, resetDebounce] = useDelayedReset<boolean>(false, true, REACTION_DEBOUNCE_TIME);

  useFrame((_state, _delta, frame) => {
    if (!session) return;

    const referenceSpace = session.requestReferenceSpace("local-floor").then((space) => space);
    inputSources.forEach(async (inputSource) => {
      if (inputSource.targetRaySpace) {
        const pose = frame.getPose(inputSource.gripSpace, await referenceSpace);
        if (pose) {
          const handQuaternion = quaternion.setFromRotationMatrix(matrix.fromArray(pose.transform.matrix));

          const worldThumbDirection = thumbForward.set(0, 0, -1).applyQuaternion(handQuaternion);

          // Determine if the thumb is pointing up or down relative to the world up
          const isPointingUp = worldThumbDirection.dot(worldUp) > 0;

          if (inputSource.handedness === "left") {
            leftThumb.current = isPointingUp ? "up" : "down";
          }
          if (inputSource.handedness === "right") {
            rightThumb.current = isPointingUp ? "up" : "down";
          }
        }
      }
    });
  });

  useEffect(() => {
    if (debounce || !session) {
      return;
    }

    if (rightPoseName === "thumb") {
      if (rightThumb.current === "up") {
        dispatch(Actions.addBoardReaction("like"));
      } else {
        dispatch(Actions.addBoardReaction("dislike"));
      }
      resetDebounce();
    }

    if (leftPoseName === "thumb") {
      if (leftThumb.current === "up") {
        dispatch(Actions.addBoardReaction("like"));
      } else {
        dispatch(Actions.addBoardReaction("dislike"));
      }
      resetDebounce();
    }

    if (leftPoseName === "peace" && rightPoseName === "peace") {
      dispatch(Actions.addBoardReaction("tada"));
      resetDebounce();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, leftPoseName, resetDebounce, rightPoseName]);

  return (
    <ImmersiveSessionOrigin>
      {inputSources.map((inputSource) =>
        inputSource.hand != null ? (
          <PoseHand setPoseName={inputSource.handedness === "left" ? setLeftPoseName : setRightPoseName} key={getInputSourceId(inputSource)} inputSource={inputSource} />
        ) : (
          <Controllers type="pointer" key={getInputSourceId(inputSource)} />
        )
      )}
    </ImmersiveSessionOrigin>
  );
};

export default XRInputs;
