import React, {useEffect, useState, useRef} from "react";
import ReactFocusLock from "react-focus-lock";
import {createPortal} from "react-dom";
import {useLocation} from "react-router";
import classNames from "classnames";
import {useAppDispatch, useAppSelector} from "store";
import {PERMANENT_EMOJIS, EmojiData} from "store/features/reactions/types";
import {addRecentEmoji} from "store/features/recentEmojis/thunks";
import {Plus} from "components/Icon";
import {ReactionModeled} from "../NoteReactionList";
import "./NoteReactionPicker.scss";
import EmojiPicker from "../EmojiPicker/EmojiPicker";

interface NoteReactionPickerProps {
  closeReactionBar: () => void;
  reactions: ReactionModeled[];
  handleClickReaction: (e: React.MouseEvent<HTMLButtonElement>, emoji: string) => void;
}

const getPickerPosition = (buttonRect: DOMRect) => {
  const [width, height, gap, margin] = [320, 350, 5, 20];
  const spaceBelow = window.innerHeight - buttonRect.bottom;
  const showAbove = spaceBelow < height + gap + margin;

  return {
    top: showAbove ? Math.max(buttonRect.top + window.scrollY - height - gap, window.scrollY + 10) : buttonRect.bottom + window.scrollY + gap,
    left: Math.max(margin, Math.min(buttonRect.left + window.scrollX, window.innerWidth - width - margin)),
  };
};

export const NoteReactionPicker = (props: NoteReactionPickerProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({top: 0, left: 0});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const locationRef = useRef(location);
  const dispatch = useAppDispatch();

  const recentEmojis = useAppSelector((state) => state.recentEmojis.emojis);
  const quickReactions: EmojiData[] = [...PERMANENT_EMOJIS, ...recentEmojis];

  // Closes emoji picker if for example SettingsDialog is being opened via keyboard shortcut
  useEffect(() => {
    if (location !== locationRef.current) {
      setShowPicker(false);
      props.closeReactionBar();
    }
  }, [location, props]);

  const handleEmojiClick = (e: React.MouseEvent<HTMLButtonElement> | Event, unicode: string) => {
    dispatch(addRecentEmoji({reactionType: unicode}));
    props.handleClickReaction(e as React.MouseEvent<HTMLButtonElement>, unicode);

    props.closeReactionBar();
  };

  const togglePicker = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!showPicker && buttonRef.current) {
      const position = getPickerPosition(buttonRef.current.getBoundingClientRect());
      setPickerPosition(position);
    }

    setShowPicker(!showPicker);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.stopPropagation();
      } else if (e.key === "Escape") {
        if (showPicker) {
          setShowPicker(false);
        } else {
          props.closeReactionBar();
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress, true);
    return () => document.removeEventListener("keydown", handleKeyPress, true);
  }, [props, showPicker]);

  return (
    <>
      <div
        className="note-reaction-picker__root"
        onClick={(e) => e.stopPropagation()} // Prevent all clicks from bubbling up
        role="toolbar"
        aria-label="Emoji reaction picker"
      >
        {/* Quick reactions: 3 permanent + 3 recent */}
        <div className="note-reaction-picker__quick-reactions">
          {quickReactions.map((reaction) => {
            const active = !!props.reactions.find((r) => r.reactionType === reaction.reactionType && !!r.myReactionId);
            return (
              <button
                key={reaction.reactionType}
                className={classNames("note-reaction-picker__reaction", {"note-reaction-picker__reaction--active": active})}
                onClick={(e) => handleEmojiClick(e, reaction.reactionType)}
              >
                {reaction.reactionType}
              </button>
            );
          })}

          {/* More emojis button */}
          <button
            ref={buttonRef}
            className={classNames("note-reaction-picker__more", {"note-reaction-picker__more--active": showPicker})}
            onClick={togglePicker}
            aria-label="More emojis"
          >
            <Plus />
          </button>
        </div>
      </div>

      {/* Emoji picker portal with its own focus lock */}
      {showPicker &&
        createPortal(
          <ReactFocusLock autoFocus={false}>
            <div
              className="note-reaction-picker__picker-portal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Emoji picker"
              style={{
                position: "fixed",
                top: `${pickerPosition.top}px`,
                left: `${pickerPosition.left}px`,
                zIndex: 190,
              }}
            >
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          </ReactFocusLock>,
          document.body
        )}
    </>
  );
};
