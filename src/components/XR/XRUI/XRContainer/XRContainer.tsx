/* eslint-disable react/no-unknown-property */
import {RootContainer, FontFamilyProvider} from "@coconut-xr/koestlich";
import {makeBorderMaterial} from "@coconut-xr/xmaterials";
import {Group, MeshPhongMaterial} from "three";
import {Suspense /* useState */, useRef} from "react";
import {BG_COLOR_DEFAULT} from "components/XR/xr-constants";
import XRBoardHeader from "../XRBoardHeader/XRBoardHeader";
import XRBoard from "../XRBoard/XRBoard";
import XRHandleBar from "../XRHandleBar/XRHandleBar";

// TODO: make semi transparent glass material
export const GlassMaterial = makeBorderMaterial(MeshPhongMaterial, {
  specular: 0xffffff,
  shininess: 100,
  transparent: true,
});

const XRContainer = () => {
  /* const [moveBarVisible, setMoveBarVisible] = useState(false); */
  const containerRef = useRef<Group>(null!);

  return (
    <Suspense>
      <FontFamilyProvider
        fontFamilies={{
          medium: ["https://coconut-xr.github.io/msdf-fonts/", "inter.json"],
          bold: ["https://coconut-xr.github.io/msdf-fonts/", "inter-bold.json"],
        }}
        defaultFontFamily="medium"
      >
        <group ref={containerRef}>
          <RootContainer
            backgroundColor={BG_COLOR_DEFAULT}
            backgroundOpacity={0.8}
            material={GlassMaterial}
            sizeX={2}
            sizeY={1}
            borderRadius={32}
            borderBend={0.3}
            border={4}
            borderColor="#888"
            borderOpacity={0.3}
            display="flex"
            flexDirection="column"
            position={[0, 1.5, -0.64]}
            positionType="relative"
            padding={6}
            /* onPointerEnter={() => setMoveBarVisible(true)}
          onPointerLeave={() => setMoveBarVisible(false)} */
          >
            <XRBoardHeader />
            <XRBoard />
            <XRHandleBar containerRef={containerRef} />
          </RootContainer>
        </group>
      </FontFamilyProvider>
    </Suspense>
  );
};

export default XRContainer;
