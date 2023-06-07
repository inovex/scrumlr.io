import {isEqual} from "underscore";
import {ReactComponent as IconEmoji} from "assets/icon-smiley.svg";
import React, {useState} from "react";
import classNames from "classnames";
import {useAppSelector} from "../../../store";
import {Reaction, ReactionImageMap, ReactionType} from "../../../types/reaction";
import {Participant} from "../../../types/participant";
import {NoteReactionChip} from "./NoteReactionChip/NoteReactionChip";
import "./NoteReactionList.scss";

interface NoteReactionListProps {
  noteId: string;
}

export interface ReactionModeled {
  reactionType: ReactionType;
  amount: number;
  users: Participant[];
  // since we reduce the reactions, we still need to know what out specific reaction id is (if it exists) so that we can operate on it (e.g. remove)
  myReactionId?: string;
  noteId: string;
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
        .reduce((acc: ReactionModeled[], reaction: Reaction, _, self) => {
          // check if a reaction of respective reaction type is already in the accumulator
          const existingReaction = acc.find((r) => r.reactionType === reaction.reactionType);
          // get the participant who issued that reaction
          const participant = participants.find((p) => p?.user.id === reaction.user);
          // if yourself made a reaction of a respective type, get the id
          const myReactionId = self.find((s) => s.user === me?.user.id && s.reactionType === reaction.reactionType)?.id;

          if (!participant) throw new Error("participant must exist");

          if (existingReaction) {
            existingReaction.amount++;
            existingReaction.users.push(participant);
          } else {
            acc.push({
              reactionType: reaction.reactionType,
              amount: 1,
              users: [participant],
              myReactionId,
              noteId: props.noteId,
            });
          }

          return acc;
        }, [])
        .sort((a, b) => a.reactionType.localeCompare(b.reactionType)), // always the same order to avoid confusion
    isEqual
  );

  const [showReactionBar, setShowReactionBar] = useState<boolean>(false);
  const toggleReactionBar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowReactionBar(!showReactionBar);
  };
  const handleBarClick = (e: React.MouseEvent<HTMLButtonElement>, reactionType: ReactionType) => {
    e.stopPropagation();
    console.log(reactionType);
  };

  return (
    <div className="note-reaction-list__root">
      <div className={classNames("note-reaction-list__reaction-bar-container", {"note-reaction-list__reaction-bar-container--active": showReactionBar})}>
        <button className="note-reaction-list__add-reaction-sticker-container" onClick={(e) => toggleReactionBar(e)}>
          <IconEmoji className="note-reaction-list__add-reaction-sticker" />
        </button>
        {showReactionBar && (
          <div className="note-reaction-list__reaction-bar">
            {[...ReactionImageMap.entries()].map(([type, emoji]) => (
              <button className="note-reaction-list__reaction-bar-reaction" onClick={(e) => handleBarClick(e, type)}>
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
      {!showReactionBar && reactions.map((r) => <NoteReactionChip reaction={r} key={r.reactionType} />)}
    </div>
  );
};
