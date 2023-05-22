import {isEqual} from "underscore";
import "./NoteReactionList.scss";
import {useAppSelector} from "../../../store";
import {Reaction, ReactionType} from "../../../types/reaction";
import {Participant} from "../../../types/participant";
import {NoteReactionChip} from "./NoteReactionChip/NoteReactionChip";

interface NoteReactionListProps {
  noteId: string;
}

export interface ReactionModeled {
  reactionType: ReactionType;
  amount: number;
  users: Participant[];
  reactedSelf: boolean;
}

export const NoteReactionList = (props: NoteReactionListProps) => {
  const me = useAppSelector((state) => state.participants?.self);
  const others = useAppSelector((state) => state.participants?.others) ?? [];
  const participants = [me, ...others];
  /*
   * a filtered reactions list, where reactions of the same type are combined into the ReactionModeled interface.
   * that way we have easy access to the amount of the same reactions and the users who made them
   */
  const reactions = useAppSelector(
    (state) =>
      state.reactions
        .filter((r) => r.note === props.noteId)
        .reduce((acc: ReactionModeled[], reaction: Reaction) => {
          const existingReaction = acc.find((r) => r.reactionType === reaction.reactionType);
          const participant = participants.find((p) => p?.user.id === reaction.user);
          const existingParticipant = existingReaction?.users.find((p) => p.user.id === participant?.user.id);
          const reactedSelf = participant?.user.id === me?.user.id;

          if (!participant) throw new Error("participant must exist");

          if (existingReaction) {
            existingReaction.amount++;
            if (!existingParticipant) {
              existingReaction.users.push(participant);
            }
          } else {
            acc.push({
              reactionType: reaction.reactionType,
              amount: 1,
              users: [participant],
              reactedSelf,
            });
          }

          return acc;
        }, []),
    isEqual
  );

  return (
    <div className="note-reaction-list__root">
      {reactions.map((r) => (
        <NoteReactionChip reaction={r} />
      ))}
    </div>
  );
};
