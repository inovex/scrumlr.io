import React, {useEffect, useState, useRef} from "react";
import ReactFocusLock from "react-focus-lock";
import {createPortal} from "react-dom";
import EmojiPicker, {EmojiClickData, Emoji} from "emoji-picker-react";
import classNames from "classnames";
import {QUICK_REACTIONS, ReactionType} from "store/features/reactions/types";
import {ReactionModeled} from "../NoteReactionList";
import "./EmojiPickerReactionBar.scss";

interface EmojiPickerReactionBarProps {
  closeReactionBar: () => void;
  reactions: ReactionModeled[];
  handleClickReaction: (e: React.MouseEvent<HTMLButtonElement>, reactionType: ReactionType) => void;
}

export const EmojiPickerReactionBar = (props: EmojiPickerReactionBarProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({top: 0, left: 0});
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClickQuickReaction = (e: React.MouseEvent<HTMLButtonElement>, reactionType: ReactionType) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent note modal from opening
    props.closeReactionBar();
    props.handleClickReaction(e, reactionType);
  };

  const handleEmojiClick = (emojiData: EmojiClickData, event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation(); // Prevent note modal from opening

    // Use the actual emoji character as the reaction type
    const reactionType = emojiData.emoji;

    props.closeReactionBar();

    // Create a synthetic mouse event for consistency with existing API
    const syntheticEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
    } as React.MouseEvent<HTMLButtonElement>;

    props.handleClickReaction(syntheticEvent, reactionType);
  };

  const togglePicker = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent note modal from opening

    if (!showPicker && buttonRef.current) {
      // Calculate position relative to viewport
      const rect = buttonRef.current.getBoundingClientRect();
      setPickerPosition({
        top: rect.bottom + window.scrollY + 5, // 5px gap
        left: rect.left + window.scrollX,
      });
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
        className="emoji-picker-reaction-bar__root"
        onClick={(e) => e.stopPropagation()} // Prevent all clicks from bubbling up
        role="toolbar"
        aria-label="Emoji reaction picker"
      >
        {/* Quick reactions (legacy emojis) */}
        <div className="emoji-picker-reaction-bar__quick-reactions">
          {QUICK_REACTIONS.map(([type, emojiData]) => {
            const active = !!props.reactions.find((r) => r.reactionType === type && !!r.myReactionId);
            return (
              <button
                key={type}
                className={classNames("emoji-picker-reaction-bar__reaction", {"emoji-picker-reaction-bar__reaction--active": active})}
                onClick={(e) => handleClickQuickReaction(e, type)}
              >
                <Emoji unified={emojiData.unified} size={20} />
              </button>
            );
          })}

          {/* More emojis button */}
          <button
            ref={buttonRef}
            className={classNames("emoji-picker-reaction-bar__more", {"emoji-picker-reaction-bar__more--active": showPicker})}
            onClick={togglePicker}
            aria-label="More emojis"
          >
            ➕
          </button>
        </div>
      </div>

      {/* Emoji picker portal with its own focus lock */}
      {showPicker &&
        createPortal(
          <ReactFocusLock autoFocus={false}>
            <div
              className="emoji-picker-reaction-bar__picker-portal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Emoji picker"
              style={{
                position: "fixed",
                top: `${pickerPosition.top}px`,
                left: `${pickerPosition.left}px`,
                zIndex: 10000,
              }}
            >
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={320}
                height={350}
                previewConfig={{showPreview: false}}
                skinTonesDisabled={false}
                searchDisabled={false}
                lazyLoadEmojis
              />
            </div>
          </ReactFocusLock>,
          document.body
        )}
    </>
  );
};
