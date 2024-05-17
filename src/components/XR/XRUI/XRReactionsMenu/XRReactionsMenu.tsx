import {Content} from "@react-three/uikit";
import {Svg} from "@react-three/drei";
import {XRButton} from "components/apfel/XRButton";
import {Card} from "components/apfel/card";
import PartyPopper from "assets/emoji/emoji-party-popper.svg";
import ClappingHands from "assets/emoji/emoji-clapping-hands.svg";
import SparklingHeart from "assets/emoji/emoji-sparkling-heart.svg";
import ThumbsUp from "assets/emoji/emoji-thumbs-up.svg";
import ThumbsDown from "assets/emoji/emoji-thumbs-down.svg";
import CloseIcon from "assets/icon-close.svg";

const XRReactionsMenu = ({close}: {close: () => void}) => (
  <Card
    positionType="absolute"
    height={64}
    width={296}
    positionBottom={-72}
    positionLeft={352}
    zIndexOffset={16}
    transformTranslateZ={16}
    justifyContent="space-evenly"
    alignItems="center"
  >
    <XRButton variant="icon" size="md">
      <Content>
        <Svg src={PartyPopper} />
      </Content>
    </XRButton>
    <XRButton variant="icon" size="md">
      <Content>
        <Svg src={ClappingHands} />
      </Content>
    </XRButton>
    <XRButton variant="icon" size="md">
      <Content>
        <Svg src={SparklingHeart} />
      </Content>
    </XRButton>
    <XRButton variant="icon" size="md">
      <Content>
        <Svg src={ThumbsUp} />
      </Content>
    </XRButton>
    <XRButton variant="icon" size="md">
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

export default XRReactionsMenu;
