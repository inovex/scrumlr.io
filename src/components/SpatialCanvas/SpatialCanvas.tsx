import {Canvas} from "@react-three/fiber";
import {Controllers, Hands, XR} from "@react-three/xr";
import "./SpatialCanvas.scss";
import {RootContainer, Container} from "@coconut-xr/koestlich";
import {useAppSelector} from "store";

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
        </XR>
        <RootContainer backgroundColor="red" sizeX={2} sizeY={1} flexDirection="row" position={[0, 1, -1]}>
          <Container flexGrow={1} margin={48} backgroundColor="green" />
          <Container flexGrow={1} margin={48} backgroundColor="blue" />
        </RootContainer>
      </Canvas>
    </div>
  );
};

export default SpatialCanvas;
