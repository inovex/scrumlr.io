import {isEqual} from "underscore";
import {useDispatch} from "react-redux";
import {ReactComponent as IconEmoji} from "assets/icon-emoji.svg";
import {ReactComponent as IconAddEmoji} from "assets/icon-add-emoji.svg";
import React, {useState} from "react";
import classNames from "classnames";
import {LongPressReactEvents} from "use-long-press";
import {useAppSelector} from "../../../store";
import {Reaction, ReactionType} from "../../../types/reaction";
import {Participant} from "../../../types/participant";
import {NoteReactionChip} from "./NoteReactionChip/NoteReactionChip";
import {NoteReactionBar} from "./NoteReactionBar/NoteReactionBar";
import {NoteReactionChipCondensed} from "./NoteReactionChipCondensed/NoteReactionChipCondensed";
import {NoteReactionPopup} from "./NoteReactionPopup/NoteReactionPopup";
import {Actions} from "../../../store/action";
import "./NoteReactionList.scss";

interface NoteReactionListProps {
  noteId: string;
  dimensions?: DOMRect; // used for note width
}

export interface ReactionModeled {
  reactionType: ReactionType;
  amount: number;
  users: Participant[];
  // since we reduce the reactions, we still need to know what out specific reaction id is (if it exists) so that we can operate on it (e.g. remove)
  myReactionId?: string;
  noteId: string;
}

const CONDENSED_VIEW_MIN_USER_AMOUNT = 3;
const CONDENSED_VIEW_WIDTH_LIMIT = 330; // pixels

export const NoteReactionList = (props: NoteReactionListProps) => {
  const dispatch = useDispatch();
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

  // only one reaction can be made per user per note
  const reactionMadeByUser = reactions.find((r) => !!r.myReactionId);

  const showCondensed = reactions.length > CONDENSED_VIEW_MIN_USER_AMOUNT && (props.dimensions?.width ?? 0) < CONDENSED_VIEW_WIDTH_LIMIT;

  const [showReactionBar, setShowReactionBar] = useState<boolean>(false);
  const [showReactionPopup, setShowReactionPopup] = useState<boolean>(false);

  const toggleReactionBar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowReactionBar(!showReactionBar);
  };

  const addReaction = (noteId: string, reactionType: ReactionType) => {
    dispatch(Actions.addReaction(noteId, reactionType));
  };

  const deleteReaction = (reactionId: string) => {
    dispatch(
      Actions.deleteReaction(reactionId) // reactedSelf === true can be asserted here because we filter it in handleClickReaction()
    );
  };

  const replaceReaction = (reactionId: string, reactionType: ReactionType) => {
    dispatch(Actions.updateReaction(reactionId, reactionType));
  };

  const handleClickReaction = (e: React.MouseEvent<HTMLButtonElement>, reactionType: ReactionType) => {
    // in board overview, prevent note from opening stack view
    e.stopPropagation();

    if (showReactionPopup) return;

    const isSameReaction = reactionMadeByUser?.reactionType === reactionType;

    // no reaction exists -> add
    if (!reactionMadeByUser) {
      addReaction(props.noteId, reactionType);
      return;
    }

    // same reaction -> remove
    if (isSameReaction) {
      deleteReaction(reactionMadeByUser.myReactionId!);
    }
    // other reaction -> replace
    else {
      replaceReaction(reactionMadeByUser.myReactionId!, reactionType);
    }
  };

  const openReactionsPopup = (e: LongPressReactEvents) => {
    e.stopPropagation();
    setShowReactionPopup(true);
  };

  const closeReactionPopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReactionPopup(false);
  };

  return (
    <div className="note-reaction-list__root">
      <div className={classNames("note-reaction-list__reaction-bar-container", {"note-reaction-list__reaction-bar-container--active": showReactionBar})}>
        <button className="note-reaction-list__add-reaction-sticker-container" onClick={(e) => toggleReactionBar(e)}>
          {showReactionBar ? <IconAddEmoji className="note-reaction-list__add-reaction-sticker" /> : <IconEmoji className="note-reaction-list__add-reaction-sticker" />}
        </button>
        {showReactionBar && <NoteReactionBar setShowReactionBar={setShowReactionBar} reactions={reactions} handleClickReaction={handleClickReaction} />}
      </div>
      <div className="note-reaction-list__reaction-chips-container">
        {!showReactionBar &&
          // show either condensed or normal reaction chips
          (showCondensed ? (
            <>
              <NoteReactionChipCondensed reactions={reactions} />
              {reactionMadeByUser && <NoteReactionChip reaction={reactionMadeByUser} handleClickReaction={handleClickReaction} handleLongPressReaction={openReactionsPopup} />}
            </>
          ) : (
            reactions.map((r) => <NoteReactionChip reaction={r} key={r.reactionType} handleClickReaction={handleClickReaction} handleLongPressReaction={openReactionsPopup} />)
          ))}
      </div>
      {showReactionPopup && <NoteReactionPopup onClose={closeReactionPopup} />}
    </div>
  );
};
