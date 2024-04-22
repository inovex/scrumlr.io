import {RootContainer, Container} from "@coconut-xr/koestlich";
import {RayGrab} from "@react-three/xr";

const XRContainer = () => (
  <RayGrab>
    <RootContainer backgroundColor="red" sizeX={2} sizeY={1} flexDirection="row" position={[0, -0.2, -1.2]}>
      <Container flexGrow={1} margin={48} backgroundColor="green" />
      <Container flexGrow={1} margin={48} backgroundColor="blue" />
    </RootContainer>
  </RayGrab>
);

export default XRContainer;
