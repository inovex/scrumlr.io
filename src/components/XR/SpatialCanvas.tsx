import "./SpatialCanvas.scss";
import {useAppSelector} from "store";
import {PointerController, PointerHand} from "@coconut-xr/natuerlich/defaults";
import {clippingEvents} from "@coconut-xr/koestlich";
import {useInputSources} from "@coconut-xr/natuerlich/react";
import {Canvas} from "@react-three/fiber";
import {XR} from "@react-three/xr";
import {useState} from "react";
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
  const initialInputSources = useInputSources();
  const [inputSources, setInputSources] = useState(initialInputSources);

  const {xrActive} = useAppSelector((state) => ({
    xrActive: state.view.xrActive,
  }));

  return (
    /* TODO: There must be a better way to make the canvas only visible when active... */
    <div className="spatial-canvas_wrapper" style={{height: !xrActive ? "0" : "100vh", width: !xrActive ? "0" : "100vw"}}>
      <Canvas className="spatial-canvas" events={clippingEvents} gl={{localClippingEnabled: true}}>
        <XR
          referenceSpace="local"
          onSessionStart={(event) => console.log(event)}
          onSessionEnd={(event) => console.log(event)}
          onInputSourcesChange={(event) => {
            const session = event.target as XRSession;
            const sources = session?.inputSources;
            const sourcesArray = Object.keys(sources).map((key) => sources[key]);
            setInputSources(sourcesArray);
          }}
        >
          <XRLight />
          <XRContainer />
          {inputSources.map((inputSource) =>
            inputSource.hand != null ? (
              <PointerHand id={getInputSourceId(inputSource)} key={getInputSourceId(inputSource)} inputSource={inputSource} hand={inputSource.hand} childrenAtJoint="wrist" />
            ) : (
              <PointerController id={getInputSourceId(inputSource)} key={getInputSourceId(inputSource)} inputSource={inputSource} />
            )
          )}
        </XR>
      </Canvas>
    </div>
  );
};

export default SpatialCanvas;
