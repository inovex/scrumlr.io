import {Container, Image, Text} from "@coconut-xr/koestlich";
import {DEFAULT_BOARD_NAME} from "constants/misc";
import {Suspense} from "react";
import {shallowEqual} from "react-redux";
import {useAppSelector} from "store";
import ScrumlrLogo from "assets/scrumlr.png";
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
    <Suspense>
      <Container
        positionType="absolute"
        width="100%"
        positionTop={0}
        positionLeft={0}
        flexDirection="row"
        index={0}
        justifyContent="space-between"
        alignItems="center"
        height={128}
      >
        <Image url={ScrumlrLogo} index={0} margin={32} marginLeft={32} width={128} />
        <Text fontSize={24} index={1} margin={32} marginLeft={16} color={FONT_COLOR}>
          {boardName || DEFAULT_BOARD_NAME}
        </Text>
        <Text fontSize={18} index={2} margin={32} marginRight={32} color={FONT_COLOR}>
          {`${them.length + 1} user${them.length > 0 ? "s" : ""} online`}
        </Text>
      </Container>
    </Suspense>
  );
};

export default XRBoardHeader;
