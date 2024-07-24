import React, {useEffect} from "react";
import ReactFocusLock from "react-focus-lock";
import classNames from "classnames";
import {REACTION_EMOJI_MAP, ReactionType} from "types/reaction";
import "./NoteReactionBar.scss";
import {useAppSelector} from "store";
import {getEmojiWithSkinTone} from "utils/reactions";
import {ReactionModeled} from "../NoteReactionList";

interface NoteReactionBarProps {
  closeReactionBar: () => void;
  reactions: ReactionModeled[];
  handleClickReaction: (e: React.MouseEvent<HTMLButtonElement>, reactionType: ReactionType) => void;
}

export const NoteReactionBar = (props: NoteReactionBarProps) => {
  const handleClickBar = (e: React.MouseEvent<HTMLButtonElement>, reactionType: ReactionType) => {
    e.preventDefault();
    props.closeReactionBar();
    props.handleClickReaction(e, reactionType);
  };
  const skinTone = useAppSelector((state) => state.skinTone);
  // this allows the selection of an emoji using the enter key
  // by preventing the note from being opened if it's active
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.stopPropagation();
      } else if (e.key === "Escape") {
        props.closeReactionBar();
      }
    };

    document.addEventListener("keydown", handleKeyPress, true);
    return () => document.removeEventListener("keydown", handleKeyPress, true);
  }, [props]);

  return (
    <div className="note-reaction-bar__root">
      <ReactFocusLock autoFocus={false}>
        {[...REACTION_EMOJI_MAP.entries()].map(([type, emoji]) => {
          // highlight reaction made by yourself
          const active = !!props.reactions.find((r) => r.reactionType === type && !!r.myReactionId);
          return (
            <button key={type} className={classNames("note-reaction-bar__reaction", {"note-reaction-bar__reaction--active": active})} onClick={(e) => handleClickBar(e, type)}>
              {getEmojiWithSkinTone(emoji, skinTone)}
            </button>
          );
        })}
      </ReactFocusLock>
    </div>
  );
};
