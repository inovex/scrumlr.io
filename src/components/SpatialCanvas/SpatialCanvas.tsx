import {Canvas} from "@react-three/fiber";
import {Controllers, Hands, XR} from "@react-three/xr";
import "./SpatialCanvas.scss";

const SpatialCanvas = () => (
    <div className="spatial-canvas_wrapper">
      <Canvas className="spatial-canvas">
        <XR onSessionStart={(event) => console.log(event)}>
          <Controllers />
          <Hands />
        </XR>
        <mesh>
          <boxGeometry />
          <meshBasicMaterial color="blue" />
        </mesh>
      </Canvas>
    </div>
  );

export default SpatialCanvas;
