import React, {useEffect, useRef, useState} from "react";
import {Portal} from "components/Portal";
import classNames from "classnames";
import {REACTION_EMOJI_MAP, ReactionType} from "types/reaction";
import {useAppSelector} from "store";
import {useIsScrolling} from "utils/hooks/useIsScrolling";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {useTranslation} from "react-i18next";
import {ReactionModeled} from "../NoteReactionList";
import {NoteReactionChip} from "../NoteReactionChip/NoteReactionChip";
import {NoteAuthorList} from "../../NoteAuthorList/NoteAuthorList";
import "./NoteReactionPopup.scss";

interface NoteReactionPopupProps {
  reactionsFlat: ReactionModeled[];
  reactionsReduced: ReactionModeled[];
  onClose: (e?: React.MouseEvent) => void;
  colorClassName?: string; // override portal color, since it's outside and doesn't know the note. possible TODO useContext
}

export const NoteReactionPopup = (props: NoteReactionPopupProps) => {
  const dispatch = useDispatch();
  const {t} = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const draggableNotchRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useIsScrolling(containerRef);
  // sum total reactions
  const totalReactions = props.reactionsReduced.reduce((acc: number, curr: ReactionModeled) => acc + curr.amount, 0);
  const viewer = useAppSelector((state) => state.participants!.self);

  // activeTab === undefined -> all are active
  const [activeTab, setActiveTab] = useState<ReactionType>();

  // after scrolling has stopped, divide the scroll offset by the main container width
  // to get which inner container is currently visible.
  // then, we can find which tab corresponds to it and set it to active.
  useEffect(() => {
    if (!isScrolling) {
      const current = containerRef.current!;
      const width = current.offsetWidth;
      const offset = current.scrollLeft;
      const index = Math.floor(offset / width);
      const tabTo = index > 0 ? props.reactionsReduced[index - 1].reactionType : undefined;
      setActiveTab(tabTo);
    }
  }, [isScrolling, props.reactionsReduced]);

  const scrollToContainer = (index: number) => {
    const current = containerRef.current!;
    const offset = current.offsetWidth * index;
    current.scrollTo({left: offset, behavior: "smooth"});
  };

  const changeTab = (e: React.MouseEvent<HTMLButtonElement>, reactionType?: ReactionType) => {
    e.stopPropagation();
    const index = reactionType ? props.reactionsReduced.findIndex((r) => r.reactionType === reactionType) + 1 : 0;
    setActiveTab(reactionType);
    scrollToContainer(index);
  };

  // on clicking your own reaction it gets removed
  const removeOwnReaction = (e: React.MouseEvent<HTMLButtonElement>, r: ReactionModeled) => {
    e.stopPropagation();
    if (r.myReactionId) {
      dispatch(Actions.deleteReaction(r.myReactionId));
    }
  };

  // automatically close when there are no reactions
  useEffect(() => {
    if (totalReactions === 0) {
      props.onClose();
    }
  }, [props, totalReactions]);

  // this is a container element. one exists for all reactions and also one for each reaction type.
  // the containers are scrollable and snap horizontally.
  const renderContainer = (reaction?: ReactionModeled) => (
    <div className="note-reaction-popup__container">
      {props.reactionsFlat
        // if a reaction is given as parameter, filter only that reaction type, otherwise show all.
        .filter((r) => (reaction ? r.reactionType === reaction.reactionType : true))
        .map((r) => (
          <div className="note-reaction-popup__row-container">
            <div className="note-reaction-popup__row">
              <NoteAuthorList authors={r.users} showAuthors viewer={viewer} key={`${r.users[0].user.id}-${reaction?.reactionType ?? "all"}`} />
              <button
                className={classNames("note-reaction-popup__row-reaction", {"note-reaction-popup__row-reaction--active": r.myReactionId})}
                onClick={(e) => removeOwnReaction(e, r)}
              >
                {REACTION_EMOJI_MAP.get(r.reactionType)}
              </button>
            </div>
            <div className="note-reaction-popup__row-divider" />
          </div>
        ))}
    </div>
  );

  return (
    <Portal hiddenOverflow onClick={props.onClose} accentColor={props.colorClassName}>
      <div className="note-reaction-popup__root" ref={rootRef}>
        <div className="note-reaction-popup__notch-container" ref={draggableNotchRef}>
          <div className="note-reaction-popup__notch" />
        </div>
        <nav className="note-reaction-popup__tab-bar">
          <button className={classNames("note-reaction-popup__tab-all", {"note-reaction-popup__tab-all--active": !activeTab})} onClick={(e) => changeTab(e, undefined)}>
            <div className="note-reaction-popup__tab--text">{t("NoteReactionsPopup.allReactionsTab")}</div>
            <div className="note-reaction-popup__tab--amount">{totalReactions}</div>
          </button>
          {props.reactionsReduced.map((r) => (
            <NoteReactionChip
              reaction={r}
              key={r.reactionType}
              overrideActive={r.reactionType === activeTab}
              showTooltip={false}
              handleClickReaction={(e) => changeTab(e, r.reactionType)}
            />
          ))}
        </nav>
        <main className="note-reaction-popup__main" ref={containerRef}>
          {renderContainer(undefined) /* render all first */}
          {props.reactionsReduced.map((r) => renderContainer(r)) /* now for each reaction type */}
        </main>
      </div>
    </Portal>
  );
};
