import {isEqual} from "underscore";
import "./NoteReactionList.scss";
import {useAppSelector} from "../../../store";
import {Reaction} from "../../../types/reaction";
import {Participant} from "../../../types/participant";

interface NoteReactionListProps {
  noteId: string;
}

interface ReactionModeled {
  reaction: Reaction;
  amount: number;
  users: Participant[];
}

export const NoteReactionList = (props: NoteReactionListProps) => {
  const me = useAppSelector((state) => state.participants?.self);
  const others = useAppSelector((state) => state.participants?.others) ?? [];
  const participants = [me, ...others];
  const reactions = useAppSelector(
    (state) =>
      state.reactions
        .filter((r) => r.note === props.noteId)
        .reduce((acc: ReactionModeled[], reaction: Reaction) => {
          const existingReaction = acc.find((r) => r.reaction.reactionType === reaction.reactionType);
          const participant = participants.find((p) => p?.user.id === reaction.user);

          if (!participant) throw new Error("participant must exist");

          if (existingReaction) {
            existingReaction.amount++;
            existingReaction.users.push(participant);
          } else {
            acc.push({
              reaction,
              amount: 1,
              users: [participant],
            });
          }

          return acc;
        }, []),
    isEqual
  );
  return <div className="note-reaction-list__root">{reactions.length > 0 ? <div>{reactions.map((r) => `${r.reaction.reactionType}: ${r.amount}`).join(", ")}</div> : null}</div>;
};
