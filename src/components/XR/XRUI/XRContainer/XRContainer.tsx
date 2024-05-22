/* eslint-disable react/no-unknown-property */
import {Group, MeshPhongMaterial, Vector3} from "three";
import {useRef, useState} from "react";
import {Root} from "@react-three/uikit";
import {Card} from "components/apfel/card";
import {useFrame} from "@react-three/fiber";
import XRBoardHeader from "../XRBoardHeader/XRBoardHeader";
import XRBoard from "../XRBoard/XRBoard";
import XRHandleBar from "../XRHandleBar/XRHandleBar";
import XRMenuBarLeft from "../XRMenuBarLeft/XRMenuBarLeft";

// TODO: make semi transparent glass material
export const GlassMaterial = MeshPhongMaterial;

const cameraDirection = new Vector3();
const WebXRExtensionCamPosition = new Vector3(0, 0, 5); // workaround to fix initial position set by the WebXR Browser Extension

const XRContainer = () => {
  const containerRef = useRef<Group>(null!);
  const [isPositionSet, setIsPositionSet] = useState(false);

  useFrame((state) => {
    if (containerRef.current) {
      // on session startup, set the initial position of the UI based on the device's position
      if (!isPositionSet && !state.camera.position.equals(WebXRExtensionCamPosition)) {
        state.camera.getWorldDirection(cameraDirection);
        cameraDirection.multiplyScalar(1.4); // 1.4 meters in front of the camera
        const newPosition = state.camera.position.clone().add(cameraDirection);
        containerRef.current.position.copy(newPosition);
        setIsPositionSet(true);
      }
      containerRef.current.lookAt(state.camera.position);
    }
  });

  return (
    <group ref={containerRef} position={[0, 1.5, -0.64]}>
      <Root sizeX={2} sizeY={1} display="flex" flexDirection="column" positionType="relative" pixelSize={0.002}>
        <XRMenuBarLeft />
        <Card>
          <XRBoardHeader />
          <XRBoard />
          <XRHandleBar containerRef={containerRef} />
        </Card>
      </Root>
    </group>
  );
};

export default XRContainer;
