import {Svg} from "@react-three/drei";
import {Container, ContainerProperties, Content, DefaultProperties, Text} from "@react-three/uikit";
import {BoardReactionProps} from "components/BoardReaction/BoardReaction";
import {memo, useRef} from "react";
import PartyPopper from "assets/emoji/emoji-party-popper.svg";
import ClappingHands from "assets/emoji/emoji-clapping-hands.svg";
import SparklingHeart from "assets/emoji/emoji-sparkling-heart.svg";
import ThumbsUp from "assets/emoji/emoji-thumbs-up.svg";
import ThumbsDown from "assets/emoji/emoji-thumbs-down.svg";
import {getRandomNumberInRange} from "utils/random";
import {useFrame} from "@react-three/fiber";
import {FONT_COLOR} from "components/XR/xr-constants";
import {useAppSelector} from "store";
import {useTranslation} from "react-i18next";
import {ReactionType} from "types/reaction";
import {Card} from "components/apfel/card";

const XR_REACTION_ICONS = new Map<ReactionType, string>([
  ["tada", PartyPopper],
  ["applause", ClappingHands],
  ["heart", SparklingHeart],
  ["like", ThumbsUp],
  ["dislike", ThumbsDown],
]);

const XRBoardReaction = (props: BoardReactionProps) => {
  const containerRef = useRef<ContainerProperties>(null!);
  const positionBottom = useRef<number>(40);

  const {t} = useTranslation();

  const me = useAppSelector((state) => state.participants!.self);
  const others = useAppSelector((state) => state.participants!.others);
  const all = [me, ...others];
  const reactionUser = all.find((p) => p.user.id === props.reaction.user)!;
  const {name} = reactionUser.user;
  const reactedSelf = reactionUser.user.id === me.user.id;
  const displayName = reactedSelf ? t("BoardReaction.me") : name;

  useFrame((_frame, delta) => {
    containerRef.current.setStyle({positionBottom: positionBottom.current});
    positionBottom.current += delta * 80;
  });

  return (
    <Container
      positionType="absolute"
      flexDirection="column"
      alignItems="center"
      positionBottom={40}
      positionLeft={getRandomNumberInRange(100, 900)}
      zIndexOffset={128}
      transformTranslateZ={128}
      ref={containerRef}
    >
      <DefaultProperties width={22} height={22} marginBottom={8}>
        <Content>
          <Svg src={XR_REACTION_ICONS.get(props.reaction.reactionType)!} />
        </Content>
      </DefaultProperties>
      <Card padding={4}>
        <Text fontSize={16} color={FONT_COLOR}>
          {displayName}
        </Text>
      </Card>
    </Container>
  );
};

export default memo(XRBoardReaction);
