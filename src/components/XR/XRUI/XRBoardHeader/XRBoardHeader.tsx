import {Svg} from "@react-three/drei";
import {DEFAULT_BOARD_NAME} from "constants/misc";
import {shallowEqual} from "react-redux";
import {Container, Content, Text} from "@react-three/uikit";
import ScrumlrLogo from "assets/scrumlr-logo-dark.svg";
import {useAppSelector} from "store";
import {FONT_COLOR} from "components/XR/xr-constants";

const XRBoardHeader = () => {
  const {boardName, them, currentUser} = useAppSelector(
    (rootState) => ({
      boardName: rootState.board.data?.name,
      them: rootState.participants!.others.filter((participant) => participant.connected),
      currentUser: rootState.participants!.self,
    }),
    shallowEqual
  );

  const isReady = currentUser.ready;
  const {raisedHand} = currentUser;

  return (
    <Container positionType="absolute" width="100%" positionTop={0} positionLeft={0} flexDirection="row" justifyContent="space-between" alignItems="center" height={32}>
      <Content padding={0} width={128} height={48} marginLeft={96} marginTop={48}>
        <Svg src={ScrumlrLogo} />
      </Content>
      <Text fontSize={24} marginTop={24} color={FONT_COLOR}>
        {boardName || DEFAULT_BOARD_NAME}
      </Text>
      <Container flexDirection="column" height={32} width="24%" gap={6}>
        <Text fontSize={16} fontWeight={500} marginTop={24} marginRight={32} color={FONT_COLOR}>
          {`${them.length + 1} user${them.length > 0 ? "s" : ""} online`}
        </Text>
        <Container marginRight={32} gap={4}>
          <Text fontWeight={500} fontSize={isReady ? 12 : 0} color={FONT_COLOR}>
            ready {raisedHand ? "&" : ""}
          </Text>
          <Text fontWeight={500} fontSize={raisedHand ? 12 : 0} color={FONT_COLOR}>
            raising hand
          </Text>
        </Container>
      </Container>
    </Container>
  );
};

export default XRBoardHeader;
