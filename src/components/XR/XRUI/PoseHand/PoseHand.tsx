import {Hands} from "@coconut-xr/natuerlich/defaults";
import {useHandPoses} from "@coconut-xr/natuerlich/react";
import {Dispatch, SetStateAction, memo} from "react";

export type HandPoseType = "fist" | "relax" | "point" | "thumb" | "peace" | "heart" | "none";

const isHandPoseType = (name: string): name is HandPoseType => ["fist", "relax", "point", "thumb", "peace", "heart", "none"].includes(name);

type PoseHandProps = {
  inputSource: XRInputSource;
  setPoseName: Dispatch<SetStateAction<HandPoseType>>;
};

const PoseHand = ({inputSource, setPoseName}: PoseHandProps) => {
  useHandPoses(
    inputSource.hand!,
    inputSource.handedness,
    (name, prevName) => {
      if (!isHandPoseType(name)) return;
      if (name !== prevName) setPoseName(name);
    },
    {
      /* fist: "fist.handpose", */
      relax: "relax.handpose",
      /* point: "point.handpose", */
      thumb: "thumb.handpose",
      peace: "peace.handpose",
      heart: "heart.handpose",
    },
    "/handposes"
  );

  return <Hands type="pointer" />;
};

export default memo(PoseHand);
