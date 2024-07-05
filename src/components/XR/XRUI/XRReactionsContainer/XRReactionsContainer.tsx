import {Container} from "@react-three/uikit";
import {useAppSelector} from "store";
import XRBoardReaction from "../XRBoardReaction/XRBoardReaction";

const XRReactionsContainer = () => {
  const boardReactions = useAppSelector((state) => state.boardReactions);

  return (
    <Container width="100%" height="100%" positionType="absolute" positionTop={0} positionLeft={0}>
      {boardReactions.map((reaction) => (
        <XRBoardReaction key={reaction.id} reaction={reaction} />
      ))}
    </Container>
  );
};

export default XRReactionsContainer;
