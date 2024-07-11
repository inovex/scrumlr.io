import {ImmersiveSessionOrigin, useInputSources, useXR} from "@coconut-xr/natuerlich/react";
import {Controllers} from "@coconut-xr/natuerlich/defaults";
import {useEffect, useRef, useState} from "react";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {REACTION_DEBOUNCE_TIME} from "components/BoardReactionMenu/BoardReactionMenu";
import {useDelayedReset} from "utils/hooks/useDelayedReset";
import {useFrame} from "@react-three/fiber";
import {Vector3} from "three";
import {ReactionType} from "types/reaction";
import {useAppSelector} from "store";
import PoseHand, {HandPoseType} from "../XRUI/PoseHand/PoseHand";

const xrInputSourceIdMap = new Map<XRInputSource, number>();

export function getInputSourceId(inputSource: XRInputSource): number {
  let id = xrInputSourceIdMap.get(inputSource);
  if (id == null) {
    xrInputSourceIdMap.set(inputSource, (id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)));
  }
  return id;
}

const thumbForward = new Vector3(0, 0, -1);
const worldUp = new Vector3(0, 1, 0);
const leftPosition = new Vector3();
const rightPosition = new Vector3();

const XRInputs = () => {
  const {session} = useXR();
  const inputSources = useInputSources();
  const referenceSpace = useRef<XRReferenceSpace | XRBoundedReferenceSpace>();
  const [leftPoseName, setLeftPoseName] = useState<HandPoseType>("none");
  const [rightPoseName, setRightPoseName] = useState<HandPoseType>("none");
  const leftThumb = useRef<"up" | "down" | undefined>();
  const rightThumb = useRef<"up" | "down" | undefined>();
  const gestureActive = useRef<boolean>(false);
  const handsDistance = useRef<number>(Infinity);
  const raisingHand = useRef<boolean>(false);

  const dispatch = useDispatch();

  const [debounce, resetDebounce] = useDelayedReset<boolean>(false, true, REACTION_DEBOUNCE_TIME);

  const {user} = useAppSelector((state) => ({user: state.participants!.self.user.id}));

  const dispatchReaction = (reaction: ReactionType) => {
    dispatch(Actions.addBoardReaction(reaction));
    resetDebounce();
    gestureActive.current = true;
  };

  const dispatchRaisedHand = (raised: boolean) => {
    dispatch(Actions.setRaisedHand(user, raised));
    raisingHand.current = raised;
  };

  useEffect(() => {
    if (!session) return;
    session.requestReferenceSpace("local-floor").then((space) => {
      referenceSpace.current = space;
    });
  }, [session]);

  useFrame((_state, _delta, frame) => {
    if (debounce || !session || !referenceSpace.current) return;

    inputSources.forEach((inputSource) => {
      if (!inputSource.gripSpace || !inputSource.hand) return;

      const pose = frame.getPose(inputSource.gripSpace, referenceSpace.current);
      const isPointingUp = thumbForward.set(0, 0, -1).applyQuaternion(pose.transform.orientation).dot(worldUp) > 0;

      if (inputSource.handedness === "left") {
        leftThumb.current = isPointingUp ? "up" : "down";
        leftPosition.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
      }
      if (inputSource.handedness === "right") {
        rightThumb.current = isPointingUp ? "up" : "down";
        rightPosition.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
      }

      handsDistance.current = leftPosition.distanceTo(rightPosition);
    });

    if (gestureActive.current) {
      if (handsDistance.current > 0.2) gestureActive.current = false;
      return;
    }

    const leftHandRaised = leftPoseName === "point" && leftThumb.current === "up";
    const rightHandRaised = rightPoseName === "point" && rightThumb.current === "up";

    if ((leftHandRaised || rightHandRaised) && !raisingHand.current) dispatchRaisedHand(true);
    else if (!leftHandRaised && !rightHandRaised && raisingHand.current) dispatchRaisedHand(false);

    if (leftPoseName === "relax" && rightPoseName === "relax" && handsDistance.current < 0.1) {
      dispatchReaction("applause");
    }
    if (leftPoseName === "heart" && rightPoseName === "heart" && handsDistance.current < 0.15) {
      dispatchReaction("heart");
    }
  });

  useEffect(() => {
    if (debounce || !session) {
      return;
    }

    if (rightPoseName === "thumb") {
      if (rightThumb.current === "up") {
        dispatchReaction("like");
        return;
      }
      dispatchReaction("dislike");
      return;
    }

    if (leftPoseName === "thumb") {
      if (leftThumb.current === "up") {
        dispatchReaction("like");
        return;
      }
      dispatchReaction("dislike");
      return;
    }

    if (leftPoseName === "peace" && rightPoseName === "peace") {
      dispatchReaction("tada");
      return;
    }

    if (leftPoseName === "heart" && rightPoseName === "heart" && handsDistance.current && handsDistance.current < 0.1) {
      dispatchReaction("heart");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftPoseName, rightPoseName]);

  return (
    <ImmersiveSessionOrigin>
      {inputSources.map((inputSource) =>
        inputSource.hand ? (
          <PoseHand setPoseName={inputSource.handedness === "left" ? setLeftPoseName : setRightPoseName} key={getInputSourceId(inputSource)} inputSource={inputSource} />
        ) : (
          <Controllers type="pointer" key={getInputSourceId(inputSource)} />
        )
      )}
    </ImmersiveSessionOrigin>
  );
};

export default XRInputs;
