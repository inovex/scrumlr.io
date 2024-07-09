import "./SpatialCanvas.scss";
import {XRCanvas} from "@coconut-xr/natuerlich/defaults";
import {useHeighestAvailableFrameRate, useNativeFramebufferScaling} from "@coconut-xr/natuerlich/react";
import {shallowEqual} from "react-redux";
import {useAppSelector} from "store";
import {BasicShadowMap} from "three";
import {Environment} from "@react-three/drei";
import XRLight from "./XRUI/XRLight/XRLight";
import XRContainer from "./XRUI/XRContainer/XRContainer";
import XRInputs from "./XRInputs/XRInputs";

const SpatialCanvas = () => {
  const {xrSession} = useAppSelector(
    (rootState) => ({
      xrSession: rootState.view.xrSession,
    }),
    shallowEqual
  );

  const frameBufferScaling = useNativeFramebufferScaling();
  const heighestAvailableFramerate = useHeighestAvailableFrameRate();

  return (
    <XRCanvas
      dpr={window.devicePixelRatio}
      gl={{localClippingEnabled: true}}
      frameBufferScaling={frameBufferScaling}
      frameRate={heighestAvailableFramerate}
      style={{position: "absolute", inset: 0, pointerEvents: "none"}}
      shadowMap={{enabled: true, type: BasicShadowMap}}
      shadows
    >
      {xrSession && (
        <>
          <XRLight />
          <XRContainer />
          <XRInputs />
          {xrSession === "VR" && <Environment files="../environments/dikhololo_night_4k.hdr" background />}
        </>
      )}
    </XRCanvas>
  );
};

export default SpatialCanvas;
