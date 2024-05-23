import "./SpatialCanvas.scss";
import {PointerController, TouchHand, XRCanvas} from "@coconut-xr/natuerlich/defaults";
import {ImmersiveSessionOrigin, useHeighestAvailableFrameRate, useInputSources, useNativeFramebufferScaling} from "@coconut-xr/natuerlich/react";
import {shallowEqual} from "react-redux";
import {useAppSelector} from "store";
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
  const {xrActive} = useAppSelector(
    (rootState) => ({
      xrActive: rootState.view.xrActive,
    }),
    shallowEqual
  );

  const inputSources = useInputSources();

  const frameBufferScaling = useNativeFramebufferScaling();
  const heighestAvailableFramerate = useHeighestAvailableFrameRate();

  return (
    <XRCanvas
      dpr={window.devicePixelRatio}
      gl={{localClippingEnabled: true}}
      frameBufferScaling={frameBufferScaling}
      frameRate={heighestAvailableFramerate}
      style={{position: "absolute", inset: 0, pointerEvents: "none"}}
    >
      {xrActive && (
        <>
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
        </>
      )}
    </XRCanvas>
  );
};

export default SpatialCanvas;
