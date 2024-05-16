/* eslint-disable react/no-unknown-property */
import {Group, MeshPhongMaterial} from "three";
import {useRef} from "react";
import {Root} from "@react-three/uikit";
import {Card} from "components/apfel/card";
import XRBoardHeader from "../XRBoardHeader/XRBoardHeader";
import XRBoard from "../XRBoard/XRBoard";
import XRHandleBar from "../XRHandleBar/XRHandleBar";

// TODO: make semi transparent glass material
export const GlassMaterial = MeshPhongMaterial;

const XRContainer = () => {
  /* const [moveBarVisible, setMoveBarVisible] = useState(false); */
  const containerRef = useRef<Group>(null!);

  return (
    <group ref={containerRef} position={[0, 1.5, -0.64]}>
      <Root sizeX={2} sizeY={1} display="flex" flexDirection="column" positionType="relative" pixelSize={0.0025}>
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
