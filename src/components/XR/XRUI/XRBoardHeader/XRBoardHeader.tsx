import {DEFAULT_BOARD_NAME} from "constants/misc";
import {shallowEqual} from "react-redux";
import {Container, Image, Text} from "@react-three/uikit";
import ScrumlrLogo from "assets/scrumlr.png";
/* import Scrumlr from "public/scrumlr-logo-light.svg"; */
import {useAppSelector} from "store";
import {FONT_COLOR} from "components/XR/xr-constants";

const XRBoardHeader = () => {
  const {boardName, them} = useAppSelector(
    (rootState) => ({
      boardName: rootState.board.data?.name,
      them: rootState.participants!.others.filter((participant) => participant.connected),
      /* me: rootState.participants!.self, */
    }),
    shallowEqual
  );

  return (
    <Container positionType="absolute" width="100%" positionTop={0} positionLeft={0} flexDirection="row" justifyContent="space-between" alignItems="center" height={48}>
      <Image url={ScrumlrLogo} margin={32} marginLeft={32} width={128} />
      <Text fontSize={24} marginTop={24} color={FONT_COLOR}>
        {boardName || DEFAULT_BOARD_NAME}
      </Text>
      <Text fontSize={16} margin={32} marginTop={64} marginRight={32} color={FONT_COLOR}>
        {`${them.length + 1} user${them.length > 0 ? "s" : ""} online`}
      </Text>
    </Container>
  );
};

export default XRBoardHeader;
