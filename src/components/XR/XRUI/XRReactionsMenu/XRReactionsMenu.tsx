import {Content} from "@react-three/uikit";
import {Svg} from "@react-three/drei";
import {XRButton} from "components/apfel/XRButton";
import {Card} from "components/apfel/card";
import PartyPopper from "assets/emoji/emoji-party-popper.svg";
import ClappingHands from "assets/emoji/emoji-clapping-hands.svg";
import SparklingHeart from "assets/emoji/emoji-sparkling-heart.svg";
import ThumbsUp from "assets/emoji/emoji-thumbs-up.svg";
import ThumbsDown from "assets/emoji/emoji-thumbs-down.svg";
import CloseIcon from "assets/icons/close.svg";
import {ReactionType} from "types/reaction";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {useDelayedReset} from "utils/hooks/useDelayedReset";
import {REACTION_DEBOUNCE_TIME} from "components/BoardReactionMenu/BoardReactionMenu";
import {memo} from "react";

const XRReactionsMenu = ({close}: {close: () => void}) => {
  const dispatch = useDispatch();

  const [debounce, resetDebounce] = useDelayedReset<boolean>(false, true, REACTION_DEBOUNCE_TIME);

  const handleClick = (reaction: ReactionType) => {
    if (!debounce) {
      dispatch(Actions.addBoardReaction(reaction));
      resetDebounce();
    }
  };

  return (
    <Card
      positionType="absolute"
      height={64}
      width={296}
      positionBottom={-64}
      positionLeft={32}
      zIndexOffset={16}
      transformTranslateZ={32}
      justifyContent="space-evenly"
      alignItems="center"
    >
      <XRButton variant="icon" size="md" onClick={() => handleClick("tada")}>
        <Content>
          <Svg src={PartyPopper} />
        </Content>
      </XRButton>
      <XRButton variant="icon" size="md" onClick={() => handleClick("applause")}>
        <Content>
          <Svg src={ClappingHands} />
        </Content>
      </XRButton>
      <XRButton variant="icon" size="md" onClick={() => handleClick("heart")}>
        <Content>
          <Svg src={SparklingHeart} />
        </Content>
      </XRButton>
      <XRButton variant="icon" size="md" onClick={() => handleClick("like")}>
        <Content>
          <Svg src={ThumbsUp} />
        </Content>
      </XRButton>
      <XRButton variant="icon" size="md" onClick={() => handleClick("dislike")}>
        <Content>
          <Svg src={ThumbsDown} />
        </Content>
      </XRButton>
      <XRButton variant="icon" size="md" onClick={close}>
        <Content>
          <Svg src={CloseIcon} />
        </Content>
      </XRButton>
    </Card>
  );
};

export default memo(XRReactionsMenu);
