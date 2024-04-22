import {Container, Text} from "@coconut-xr/koestlich";
import {Suspense} from "react";

const XRBoardHeader = () => (
  <Container flexDirection="row" backgroundColor="red">
    <Suspense>
      <Text fontSize={64} index={1} margin={48} marginLeft={0} color="black">
        Scrumlr
      </Text>
    </Suspense>
  </Container>
);

export default XRBoardHeader;
