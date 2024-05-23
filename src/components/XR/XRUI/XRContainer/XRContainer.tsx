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
const currentLookAt = new Vector3();
const targetLookAt = new Vector3();

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
        containerRef.current.lookAt(state.camera.position);
        setIsPositionSet(true);
      }

      const distance = containerRef.current.position.distanceTo(state.camera.position);
      if (distance > 1) {
        // Smooth the look-at using linear interpolation
        targetLookAt.copy(state.camera.position);
        containerRef.current.lookAt(currentLookAt.lerp(targetLookAt, 0.0025 * distance ** 8));
      }
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
