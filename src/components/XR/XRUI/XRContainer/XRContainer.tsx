/* eslint-disable react/no-unknown-property */
import {Group, MeshPhongMaterial, Vector3} from "three";
import {useRef} from "react";
import {Root} from "@react-three/uikit";
import {Card} from "components/apfel/card";
import {useFrame} from "@react-three/fiber";
import XRBoardHeader from "../XRBoardHeader/XRBoardHeader";
import XRBoard from "../XRBoard/XRBoard";
import XRHandleBar from "../XRHandleBar/XRHandleBar";
import XRMenuBarLeft from "../XRMenuBarLeft/XRMenuBarLeft";
import XRContainerCue from "../XRContainerCue/XRContainerCue";
import XRReactionsContainer from "../XRReactionsContainer/XRReactionsContainer";

// TODO: make semi transparent glass material
export const GlassMaterial = MeshPhongMaterial;

const cameraDirection = new Vector3();
const newPosition = new Vector3();
const WebXRExtensionCamPosition = new Vector3(0, 0, 5); // workaround to fix initial position set by the WebXR Browser Extension

const XRContainer = () => {
  const handleBarRef = useRef<Group>(null!);
  const containerRef = useRef<Group>(null!);
  const isPositionSet = useRef(false);

  useFrame((state) => {
    if (isPositionSet.current) return;

    if (handleBarRef.current && !state.camera.position.equals(WebXRExtensionCamPosition)) {
      state.camera.getWorldDirection(cameraDirection);
      cameraDirection.multiplyScalar(1.4); // 1.4 meters in front of the camera
      cameraDirection.y -= 0.1; // 10 cm below the camera
      newPosition.copy(state.camera.position).add(cameraDirection);
      handleBarRef.current.position.copy(newPosition);
      handleBarRef.current.lookAt(state.camera.position);
      containerRef.current.rotation.copy(handleBarRef.current.rotation);
      isPositionSet.current = true;
    }
  });

  return (
    <>
      <XRContainerCue containerRef={containerRef} />
      <group ref={containerRef} position={[0, 1.5, -0.64]}>
        <Root sizeX={2} sizeY={1} display="flex" flexDirection="column" positionType="relative" pixelSize={0.002}>
          <XRMenuBarLeft />
          <Card>
            <XRBoardHeader />
            <XRBoard />
          </Card>
          <XRReactionsContainer />
        </Root>
      </group>
      <XRHandleBar containerRef={containerRef} ref={handleBarRef} />
    </>
  );
};

export default XRContainer;
