import {Hands} from "@coconut-xr/natuerlich/defaults";
import {useHandPoses} from "@coconut-xr/natuerlich/react";
import {Dispatch, SetStateAction} from "react";

type PoseHandProps = {
  inputSource: XRInputSource;
  setPoseName: Dispatch<SetStateAction<string>>;
};

const PoseHand = ({inputSource, setPoseName}: PoseHandProps) => {
  useHandPoses(
    inputSource.hand!,
    inputSource.handedness,
    (name, prevName) => {
      if (name !== prevName) setPoseName(name);
    },
    {
      fist: "fist.handpose",
      relax: "relax.handpose",
      point: "point.handpose",
      thumb: "thumb.handpose",
      horns: "horns.handpose",
      l: "l.handpose",
      peace: "peace.handpose",
      shaka: "shaka.handpose",
    }
  );

  return <Hands type="pointer" />;
};

export default PoseHand;
