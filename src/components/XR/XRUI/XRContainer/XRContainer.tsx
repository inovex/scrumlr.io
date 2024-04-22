import {RootContainer, Container} from "@coconut-xr/koestlich";
import {makeBorderMaterial} from "@coconut-xr/xmaterials";
import {RayGrab} from "@react-three/xr";
import {MeshPhongMaterial} from "three";

// TODO: make semi transparent glass material
const GlassMaterial = makeBorderMaterial(MeshPhongMaterial, {
  specular: 0xffffff,
  shininess: 100,
  transparent: true,
});

const XRContainer = () => (
  <RayGrab>
    <RootContainer
      backgroundColor="white"
      material={GlassMaterial}
      sizeX={2}
      sizeY={1}
      borderRadius={32}
      borderBend={0.3}
      border={8}
      borderColor="white"
      flexDirection="row"
      position={[0, -0.2, -1.2]}
    >
      <Container flexGrow={1} margin={48} backgroundColor="green" />
      <Container flexGrow={1} margin={48} backgroundColor="blue" />
    </RootContainer>
  </RayGrab>
);

export default XRContainer;
