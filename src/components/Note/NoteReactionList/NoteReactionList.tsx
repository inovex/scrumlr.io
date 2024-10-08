import {AddEmoji} from "components/Icon";
import React, {useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import classNames from "classnames";
import {LongPressReactEvents} from "use-long-press";
import {isEqual} from "underscore";
import {Reaction, ReactionType} from "store/features/reactions/types";
import {Participant} from "store/features/participants/types";
import {addReaction, deleteReaction, updateReaction} from "store/features";
import {useAppDispatch, useAppSelector} from "../../../store";
import {NoteReactionChip} from "./NoteReactionChip/NoteReactionChip";
import {NoteReactionBar} from "./NoteReactionBar/NoteReactionBar";
import {NoteReactionChipCondensed} from "./NoteReactionChipCondensed/NoteReactionChipCondensed";
import {NoteReactionPopup} from "./NoteReactionPopup/NoteReactionPopup";
import "./NoteReactionList.scss";

interface NoteReactionListProps {
  noteId: string;
  dimensions?: DOMRect; // used for note width
  colorClassName?: string;
  show: boolean;
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
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const me = useAppSelector((state) => state.participants?.self)!;
  const others = useAppSelector((state) => state.participants?.others) ?? [];
  const participants = [me, ...others];

  const isModerator = useAppSelector((state) => ["OWNER", "MODERATOR"].some((role) => state.participants!.self!.role === role));
  const boardLocked = useAppSelector((state) => state.board.data!.isLocked);

  /** helper function that converts a Reaction object to ReactionModeled object */
  const convertToModeled = (reaction: Reaction) => {
    // get the participant who issued that reaction
    const participant = participants.find((p) => p?.user.id === reaction.user);
    // if yourself made a reaction of a respective type, get the id
    const myReactionId = reaction.user === me?.user.id ? reaction.id : undefined;

    if (!participant) throw new Error("participant must exist");

    return {
      reactionType: reaction.reactionType,
      amount: 1,
      users: [participant],
      myReactionId,
      noteId: reaction.note,
    } as ReactionModeled;
  };

  /**
   * a flat array where each reaction of a note is cast to the type ReactionModeled.
   * use this if you want to handle each reaction each on its own
   */
  const reactionsFlat = useAppSelector((state) => state.reactions.filter((r) => r.note === props.noteId).map((r) => convertToModeled(r)), isEqual);
  // swap own reaction to first place
  const myIndex = reactionsFlat.findIndex((r) => r.myReactionId);
  if (myIndex > 0) {
    // in-place swap
    [reactionsFlat[myIndex], reactionsFlat[0]] = [reactionsFlat[0], reactionsFlat[myIndex]];
  }

  /*
   * a reduced reactions list, where reactions of the same type are combined into the ReactionModeled interface.
   * that way we have easy access to the amount of the same reactions and the users who made them
   * use this if you want to handle each group of reactions
   */
  const reactionsReduced = useAppSelector(
    (state) =>
      state.reactions
        .filter((r) => r.note === props.noteId)
        .map((r) => convertToModeled(r))
        // cannot reuse reactionsFlat here because of the reference objects will interfere, so we have to regenerate it with different objects
        .reduce((acc: ReactionModeled[], curr) => {
          // check if a reaction of respective reaction type is already in the accumulator
          const existingReaction = acc.find((r) => r.reactionType === curr.reactionType);
          if (existingReaction) {
            existingReaction.amount++;
            existingReaction.users.push(...curr.users); // exactly one user existing can be asserted (see convertToModeled)

            // if your own reaction is found while iterating, add it to the object
            if (curr.myReactionId) {
              existingReaction.myReactionId = curr.myReactionId;
            }
          } else {
            acc.push(curr);
          }
          return acc;
        }, []),
    isEqual
  );

  // only one reaction can be made per user per note
  const reactionMadeByUser = reactionsReduced.find((r) => !!r.myReactionId);

  const showCondensed = reactionsReduced.length > CONDENSED_VIEW_MIN_USER_AMOUNT && (props.dimensions?.width ?? 0) < CONDENSED_VIEW_WIDTH_LIMIT;

  const [showReactionBar, setShowReactionBar] = useState<boolean>(false);
  const [showReactionPopup, setShowReactionPopup] = useState<boolean>(false);

  // extra function because it is exported in a prop and passing the dispatch function directly seems wrong to me
  const closeReactionBar = () => {
    setShowReactionBar(false);
  };

  // on clicking anywhere but the note, close the reaction bar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        // click not inside note -> close bar
        setShowReactionBar(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, [rootRef]);

  const dispatchAddReaction = (noteId: string, reactionType: ReactionType) => {
    dispatch(addReaction({noteId, reactionType}));
  };

  const dispatchDeleteReaction = (reactionId: string) => {
    dispatch(
      deleteReaction(reactionId) // reactedSelf === true can be asserted here because we filter it in handleClickReaction()
    );
  };

  const dispatchReplaceReaction = (reactionId: string, reactionType: ReactionType) => {
    dispatch(updateReaction({reactionId, reactionType}));
  };

  const handleClickReaction = (e: React.MouseEvent<HTMLButtonElement>, reactionType: ReactionType) => {
    // in board overview, prevent note from opening stack view
    e.stopPropagation();

    if (showReactionPopup) return;

    const isSameReaction = reactionMadeByUser?.reactionType === reactionType;

    // no reaction exists -> add
    if (!reactionMadeByUser) {
      dispatchAddReaction(props.noteId, reactionType);
      return;
    }

    // same reaction -> remove
    if (isSameReaction) {
      dispatchDeleteReaction(reactionMadeByUser.myReactionId!);
    }
    // other reaction -> replace
    else {
      dispatchReplaceReaction(reactionMadeByUser.myReactionId!, reactionType);
    }
  };

  const openReactionsPopup = (e: LongPressReactEvents) => {
    e.stopPropagation();
    setShowReactionPopup(true);
  };

  const closeReactionPopup = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setShowReactionPopup(false);
  };

  if (!props.show) return null;

  return (
    <div className="note-reaction-list__root" ref={rootRef}>
      {(isModerator || !boardLocked) && (
        <div className={classNames("note-reaction-list__reaction-bar-container", {"note-reaction-list__reaction-bar-container--active": showReactionBar})}>
          <button
            className="note-reaction-list__add-reaction-sticker-container"
            aria-label={t("NoteReactionList.toggleBarLabel")}
            onClick={(e) => {
              e.stopPropagation();
              setShowReactionBar((show) => !show);
            }}
            onKeyDown={(e) => {
              if (e.code === "Enter" || e.code === "Space") {
                // Stop the default, because it will dispatch a click event on
                // the first reaction
                e.preventDefault();
                // Stop propagation of the event so that it does not bubble up
                // to the note component and opens the stack view
                e.stopPropagation();
                // Open the reaction bar
                setShowReactionBar((show) => !show);
              }
            }}
          >
            <AddEmoji className="note-reaction-list__add-reaction-sticker" />
          </button>
          {showReactionBar && <NoteReactionBar closeReactionBar={closeReactionBar} reactions={reactionsReduced} handleClickReaction={handleClickReaction} />}
        </div>
      )}
      <div className="note-reaction-list__reaction-chips-container" ref={listRef}>
        {!showReactionBar &&
          // show either condensed or normal reaction chips
          (showCondensed ? (
            <>
              <NoteReactionChipCondensed reactions={reactionsReduced} handleLongPressReaction={openReactionsPopup} />
              {reactionMadeByUser && (
                <NoteReactionChip reaction={reactionMadeByUser} handleClickReaction={handleClickReaction} handleLongPressReaction={openReactionsPopup} showTooltip />
              )}
            </>
          ) : (
            reactionsReduced.map((r) => (
              <NoteReactionChip reaction={r} key={r.reactionType} handleClickReaction={handleClickReaction} handleLongPressReaction={openReactionsPopup} showTooltip />
            ))
          ))}
      </div>
      {showReactionPopup && (
        <NoteReactionPopup reactionsFlat={reactionsFlat} reactionsReduced={reactionsReduced} onClose={closeReactionPopup} colorClassName={props.colorClassName} />
      )}
    </div>
  );
};
