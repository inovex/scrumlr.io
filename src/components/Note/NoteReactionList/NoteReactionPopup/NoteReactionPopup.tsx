import React, {useEffect, useRef, useState} from "react";
import {Portal} from "components/Portal";
import classNames from "classnames";
import {ReactionImageMap, ReactionType} from "types/reaction";
import _ from "underscore";
import {useAppSelector} from "store";
import {useIsScrolling} from "utils/hooks/useIsScrolling";
import {ReactionModeled} from "../NoteReactionList";
import {NoteReactionChip} from "../NoteReactionChip/NoteReactionChip";
import {NoteAuthorList} from "../../NoteAuthorList/NoteAuthorList";
import "./NoteReactionPopup.scss";

interface NoteReactionPopupProps {
  reactionsFlat: ReactionModeled[];
  reactionsReduced: ReactionModeled[];
  onClose: (e: React.MouseEvent) => void;
}

export const NoteReactionPopup = (props: NoteReactionPopupProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useIsScrolling(containerRef);
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

  const renderContainer = (reaction?: ReactionModeled) => (
    <div className="note-reaction-popup__container">
      {props.reactionsFlat
        .filter((r) => (reaction ? r.reactionType === reaction.reactionType : true))
        .map((r) => (
          <div className="note-reaction-popup__row-container" key={`${r.users[0].user.id}-${r.reactionType}`}>
            <div className="note-reaction-popup__row">
              <NoteAuthorList authors={r.users} showAuthors viewer={viewer} />
              <div className={classNames("note-reaction-popup__row-reaction", {"note-reaction-popup__row-reaction--active": r.myReactionId})}>
                {ReactionImageMap.get(r.reactionType)}
              </div>
            </div>
            <div className="note-reaction-popup__row-divider" />
          </div>
        ))}
    </div>
  );

  return (
    <Portal hiddenOverflow onClick={props.onClose}>
      <div className="note-reaction-popup__root">
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
