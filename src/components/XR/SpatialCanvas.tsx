import {Canvas} from "@react-three/fiber";
import {Controllers, Hands, XR} from "@react-three/xr";
import "./SpatialCanvas.scss";
import {useAppSelector} from "store";
import XRContainer from "./XRUI/XRContainer/XRContainer";

const SpatialCanvas = () => {
  const {xrActive} = useAppSelector((state) => ({
    xrActive: state.view.xrActive,
  }));

  return (
    /* TODO: There must be a better way to make the canvas only visible when active... */
    <div className="spatial-canvas_wrapper" style={{height: !xrActive ? "0" : "100vh", width: !xrActive ? "0" : "100vw"}}>
      <Canvas className="spatial-canvas">
        <XR referenceSpace="local" onSessionStart={(event) => console.log(event)} onSessionEnd={(event) => console.log(event)}>
          <Controllers />
          <Hands />
          <XRContainer />
        </XR>
      </Canvas>
    </div>
  );
};

export default SpatialCanvas;
