import "./SpatialCanvas.scss";
import store, {useAppSelector} from "store";
import {PointerController, TouchHand, XRCanvas} from "@coconut-xr/natuerlich/defaults";
import {ImmersiveSessionOrigin, useHeighestAvailableFrameRate, useInputSources, useNativeFramebufferScaling, useXR} from "@coconut-xr/natuerlich/react";
import {useEffect} from "react";
import {Actions} from "store/action";
import XRLight from "./XRUI/XRLight/XRLight";
import XRContainer from "./XRUI/XRContainer/XRContainer";

const xrInputSourceIdMap = new Map<XRInputSource, number>();

export function getInputSourceId(inputSource: XRInputSource): number {
  let id = xrInputSourceIdMap.get(inputSource);
  if (id == null) {
    xrInputSourceIdMap.set(inputSource, (id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)));
  }
  return id;
}

const SpatialCanvas = () => {
  const inputSources = useInputSources();
  const {mode} = useXR.getState();

  const {xrActive} = useAppSelector((state) => ({
    xrActive: state.view.xrActive,
  }));

  const frameBufferScaling = useNativeFramebufferScaling();
  const heighestAvailableFramerate = useHeighestAvailableFrameRate();

  useEffect(() => {
    store.dispatch(Actions.setXRActive(mode !== "none"));
  }, [mode]);

  return (
    <XRCanvas
      dpr={window.devicePixelRatio}
      gl={{localClippingEnabled: true}}
      frameBufferScaling={frameBufferScaling}
      frameRate={heighestAvailableFramerate}
      style={{position: "absolute", inset: 0, visibility: xrActive ? "visible" : "hidden"}}
    >
      <XRLight />
      <XRContainer />
      <ImmersiveSessionOrigin>
        {inputSources.map((inputSource) =>
          inputSource.hand != null ? (
            <TouchHand id={getInputSourceId(inputSource)} key={getInputSourceId(inputSource)} inputSource={inputSource} hand={inputSource.hand} childrenAtJoint="wrist" />
          ) : (
            <PointerController id={getInputSourceId(inputSource)} key={getInputSourceId(inputSource)} inputSource={inputSource} />
          )
        )}
      </ImmersiveSessionOrigin>
    </XRCanvas>
  );
};

export default SpatialCanvas;
