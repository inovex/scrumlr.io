import {ImmersiveSessionOrigin, useInputSources} from "@coconut-xr/natuerlich/react";
import {Controllers} from "@coconut-xr/natuerlich/defaults";
import {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {REACTION_DEBOUNCE_TIME} from "components/BoardReactionMenu/BoardReactionMenu";
import {useDelayedReset} from "utils/hooks/useDelayedReset";
import PoseHand from "../XRUI/PoseHand/PoseHand";

const xrInputSourceIdMap = new Map<XRInputSource, number>();

export function getInputSourceId(inputSource: XRInputSource): number {
  let id = xrInputSourceIdMap.get(inputSource);
  if (id == null) {
    xrInputSourceIdMap.set(inputSource, (id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)));
  }
  return id;
}

const XRInputs = () => {
  const inputSources = useInputSources();
  const [leftPoseName, setLeftPoseName] = useState("none");
  const [rightPoseName, setRightPoseName] = useState("none");

  const dispatch = useDispatch();

  const [debounce, resetDebounce] = useDelayedReset<boolean>(false, true, REACTION_DEBOUNCE_TIME);

  useEffect(() => {
    if (debounce) {
      return;
    }
    if (leftPoseName === "thumb" || rightPoseName === "thumb") {
      dispatch(Actions.addBoardReaction("like"));
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
