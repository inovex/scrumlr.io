import React, {useEffect, useRef, useState} from "react";
import {Portal} from "components/Portal";
import classNames from "classnames";
import {ReactionImageMap, ReactionType} from "types/reaction";
import _ from "underscore";
import {useAppSelector} from "store";
import {useIsScrolling} from "utils/hooks/useIsScrolling";
import {useMoveDelta} from "utils/hooks/useMoveDelta";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
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

const CLOSING_THRESHOLD_PERCENT = 80; // %

export const NoteReactionPopup = (props: NoteReactionPopupProps) => {
  const dispatch = useDispatch();
  const rootRef = useRef<HTMLDivElement>(null);
  const draggableNotchRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useIsScrolling(containerRef);
  const popupDelta = useMoveDelta(draggableNotchRef);
  const containerOffsetHeight = popupDelta.y + (rootRef.current?.offsetHeight ?? 0);
  const popupTranslateY = containerOffsetHeight > 0 ? containerOffsetHeight : 0;
  // sum total reactions
  const totalReactions = props.reactionsReduced.reduce((acc: number, curr: ReactionModeled) => acc + curr.amount, 0);
  const viewer = useAppSelector((state) => state.participants!.self, _.isEqual);

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

  // close popup if moving it below the threshold
  useEffect(() => {
    const containerFullHeight = rootRef.current!.getBoundingClientRect().height;
    const calculatedThreshold = (containerFullHeight * CLOSING_THRESHOLD_PERCENT) / 100;

    if (popupTranslateY > calculatedThreshold) {
      props.onClose();
    }
  }, [popupTranslateY, props]);

  // this is a container element. one exists for all reactions and also one for each reaction type.
  // the containers are scrollable and snap horizontally.
  const renderContainer = (reaction?: ReactionModeled) => (
    <div className="note-reaction-popup__container">
      {props.reactionsFlat
        // if a reaction is given as parameter, filter only that reaction type, otherwise show all.
        .filter((r) => (reaction ? r.reactionType === reaction.reactionType : true))
        .map((r) => (
          <div className="note-reaction-popup__row-container" key={`${r.users[0].user.id}-${r.reactionType}`}>
            <div className="note-reaction-popup__row">
              <NoteAuthorList authors={r.users} showAuthors viewer={viewer} />
              <button
                className={classNames("note-reaction-popup__row-reaction", {"note-reaction-popup__row-reaction--active": r.myReactionId})}
                onClick={(e) => removeOwnReaction(e, r)}
              >
                {ReactionImageMap.get(r.reactionType)}
              </button>
            </div>
            <div className="note-reaction-popup__row-divider" />
          </div>
        ))}
    </div>
  );

  return (
    <Portal hiddenOverflow onClick={props.onClose} accentColor={props.colorClassName}>
      <div className="note-reaction-popup__root" ref={rootRef} style={{transform: `translate(-50%, ${popupTranslateY}px)`}}>
        <div className="note-reaction-popup__notch-container" ref={draggableNotchRef}>
          <div className="note-reaction-popup__notch" />
        </div>
        <nav className="note-reaction-popup__tab-bar">
          <button className={classNames("note-reaction-popup__tab-all", {"note-reaction-popup__tab-all--active": !activeTab})} onClick={(e) => changeTab(e, undefined)}>
            <div className="note-reaction-popup__tab--text">Alle</div>
            <div className="note-reaction-popup__tab--amount">{totalReactions}</div>
          </button>
          {props.reactionsReduced.map((r) => (
            <NoteReactionChip reaction={r} key={r.reactionType} overrideActive={r.reactionType === activeTab} handleClickReaction={(e) => changeTab(e, r.reactionType)} />
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
