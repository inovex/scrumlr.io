import React, {useEffect, useState, useRef} from "react";
import ReactFocusLock from "react-focus-lock";
import {createPortal} from "react-dom";
import EmojiPicker, {EmojiClickData, Emoji, Theme as EmojiPickerTheme} from "emoji-picker-react";
import classNames from "classnames";
import {LEGACY_REACTION_EMOJI_MAP, ReactionType} from "store/features/reactions/types";
import {useAppSelector} from "store";
import {Theme} from "store/features/view/types";
import {ReactionModeled} from "../NoteReactionList";
import "./EmojiPickerReactionBar.scss";

interface EmojiPickerReactionBarProps {
  closeReactionBar: () => void;
  reactions: ReactionModeled[];
  handleClickReaction: (e: React.MouseEvent<HTMLButtonElement>, reactionType: ReactionType) => void;
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

const convertToEmojiPickerTheme = (appTheme: Theme): EmojiPickerTheme =>
  // emoji-picker-react supports "light", "dark", and "auto"
  // Our app uses the same values, so we can directly cast
  appTheme as EmojiPickerTheme;

const RECENT_EMOJIS_KEY = "scrumlr-recent-emojis";
const MAX_RECENT_EMOJIS = 5;

const getRecentEmojis = (): string[] => {
  try {
    const stored = localStorage.getItem(RECENT_EMOJIS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addRecentEmoji = (emoji: string): void => {
  try {
    const recent = getRecentEmojis();
    const filtered = recent.filter((e) => e !== emoji);
    const updated = [emoji, ...filtered].slice(0, MAX_RECENT_EMOJIS);
    localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail if localStorage is not available
  }
};

export const EmojiPickerReactionBar = (props: EmojiPickerReactionBarProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({top: 0, left: 0});
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const theme = useAppSelector((state) => state.view.theme);

  // Load recent emojis on component mount
  useEffect(() => {
    setRecentEmojis(getRecentEmojis());
  }, []);

  const handleClickQuickReaction = (e: React.MouseEvent<HTMLButtonElement>, reactionType: ReactionType) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent note modal from opening

    // Add to recent emojis if it's not a legacy reaction
    if (!LEGACY_REACTION_EMOJI_MAP.has(reactionType)) {
      addRecentEmoji(reactionType);
      setRecentEmojis(getRecentEmojis());
    }

    props.closeReactionBar();
    props.handleClickReaction(e, reactionType);
  };

  const handleEmojiClick = (emojiData: EmojiClickData, event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation(); // Prevent note modal from opening

    // Use the actual emoji character as the reaction type
    const reactionType = emojiData.emoji;

    // Add to recent emojis
    addRecentEmoji(reactionType);
    setRecentEmojis(getRecentEmojis());

    props.closeReactionBar();

    // Create a synthetic mouse event for consistency with existing API
    const syntheticEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
    } as React.MouseEvent<HTMLButtonElement>;

    props.handleClickReaction(syntheticEvent, reactionType);
  };

  // Create quick reactions from recent emojis, falling back to legacy reactions
  const quickReactions: Array<{emoji: string; type: string; unified?: string}> =
    recentEmojis.length > 0
      ? recentEmojis.map((emoji) => ({emoji, type: emoji}))
      : Array.from(LEGACY_REACTION_EMOJI_MAP.entries())
          .slice(0, 5)
          .map(([type, data]) => ({
            emoji: data.emoji,
            type,
            unified: data.unified,
          }));

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
        className="emoji-picker-reaction-bar__root"
        onClick={(e) => e.stopPropagation()} // Prevent all clicks from bubbling up
        role="toolbar"
        aria-label="Emoji reaction picker"
      >
        {/* Quick reactions (recent or legacy emojis) */}
        <div className="emoji-picker-reaction-bar__quick-reactions">
          {quickReactions.map((reaction, index) => {
            const active = !!props.reactions.find((r) => r.reactionType === reaction.type && !!r.myReactionId);
            return (
              <button
                key={reaction.type}
                className={classNames("emoji-picker-reaction-bar__reaction", {"emoji-picker-reaction-bar__reaction--active": active})}
                onClick={(e) => handleClickQuickReaction(e, reaction.type)}
              >
                {reaction.unified ? <Emoji unified={reaction.unified} size={20} /> : <span style={{fontSize: "20px"}}>{reaction.emoji}</span>}
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
                theme={convertToEmojiPickerTheme(theme)}
              />
            </div>
          </ReactFocusLock>,
          document.body
        )}
    </>
  );
};
