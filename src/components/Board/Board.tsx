import React, {useEffect, useRef, useState} from "react";
import {getColorClassName} from "constants/colors";
import {ColumnProps} from "components/Column";
import {MenuBars} from "components/MenuBars";
import {InfoBar} from "components/Infobar";
import {BoardHeader} from "components/BoardHeader";
import {HotkeyAnchor} from "components/HotkeyAnchor";
import "./Board.scss";
import {useDndMonitor} from "@dnd-kit/core";
import classNames from "classnames";
import {useStripeOffset} from "utils/hooks/useStripeOffset";

export interface BoardProps {
  children: React.ReactElement<ColumnProps> | React.ReactElement<ColumnProps>[];
  currentUserIsModerator: boolean;
  moderating: boolean;
}

export interface BoardState {
  showNextButton: boolean;
  showPreviousButton: boolean;
}

export interface ColumnState {
  firstVisibleColumnIndex: number;
  lastVisibleColumnIndex: number;
}

export const BoardComponent = ({children, currentUserIsModerator, moderating}: BoardProps) => {
  const [state, setState] = useState<BoardState & ColumnState>({
    firstVisibleColumnIndex: 0,
    lastVisibleColumnIndex: React.Children.count(children),
    showNextButton: false,
    showPreviousButton: false,
  });

  const [columnState, setColumnState] = useState<ColumnState>({
    firstVisibleColumnIndex: 0,
    lastVisibleColumnIndex: React.Children.count(children),
  });

  const [dragActive, setDragActive] = useState(false);
  useDndMonitor({
    onDragStart() {
      setDragActive(true);
    },
    onDragEnd() {
      setDragActive(false);
    },
    onDragCancel() {
      setDragActive(false);
    },
  });

  const boardRef = useRef<HTMLDivElement>(null);
  const columnVisibilityStatesRef = useRef<boolean[]>([]);

  const columnsCount = React.Children.count(children);

  // stripe offset for spacer divs
  const leftSpacerOffset = useStripeOffset<HTMLDivElement>({gradientLength: 40, gradientAngle: 45});
  const rightSpacerOffset = useStripeOffset<HTMLDivElement>({gradientLength: 40, gradientAngle: 45});

  useEffect(() => {
    leftSpacerOffset.updateOffset();
    rightSpacerOffset.updateOffset();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  useEffect(() => {
    const board = boardRef.current;

    if (board) {
      // initialize column visibility states
      columnVisibilityStatesRef.current = new Array(React.Children.count(children));
      const columnVisibilityStates = columnVisibilityStatesRef.current;
      columnVisibilityStates.fill(false);

      // initialize intersection observer
      const observerOptions = {
        root: board,
        rootMargin: "0px",
        threshold: 1.0,
      };
      const observerCallback: IntersectionObserverCallback = (entries) => {
        entries.forEach((entry) => {
          const index = Array.prototype.indexOf.call(board.children, entry.target) - 1;
          columnVisibilityStates[index] = entry.isIntersecting;
        });

        const firstVisibleColumnIndex = columnVisibilityStates.findIndex((value) => value);
        const lastVisibleColumnIndex = columnVisibilityStates.lastIndexOf(true);

        setColumnState({
          firstVisibleColumnIndex,
          lastVisibleColumnIndex,
        });
      };
      const observer = new IntersectionObserver(observerCallback, observerOptions);

      // observe children
      const domChildren = board.children;
      for (let i = 1; i < domChildren.length - 1; i += 1) {
        observer.observe(domChildren[i]);
      }

      // return callback handler that will disconnect the observer on unmount
      return () => {
        observer.disconnect();
      };
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  useEffect(() => {
    let firstVisibleColumnIndex;
    let lastVisibleColumnIndex;

    if (columnState.firstVisibleColumnIndex === -1 && columnState.lastVisibleColumnIndex === -1) {
      firstVisibleColumnIndex = state.firstVisibleColumnIndex;
      lastVisibleColumnIndex = state.firstVisibleColumnIndex - 1;
    } else {
      firstVisibleColumnIndex = columnState.firstVisibleColumnIndex;
      lastVisibleColumnIndex = columnState.lastVisibleColumnIndex;
    }

    setState({
      firstVisibleColumnIndex,
      lastVisibleColumnIndex,
      showNextButton: lastVisibleColumnIndex < columnsCount - 1,
      showPreviousButton: firstVisibleColumnIndex > 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnState]);

  if (!children || columnsCount === 0) {
    // Empty board
    return (
      <div className="board--empty">
        <style>{`.board { --board__columns: ${columnsCount} }`}</style>
        <BoardHeader currentUserIsModerator={currentUserIsModerator} />
        <InfoBar />
        <MenuBars showPreviousColumn={false} showNextColumn={false} onPreviousColumn={() => {}} onNextColumn={() => {}} />
        <HotkeyAnchor />
        <main className="board" ref={boardRef}>
          {/* Fixed color - can also be dynamic */}
          <div className={`board__spacer-left ${getColorClassName("backlog-blue")}`} {...leftSpacerOffset.bindings} />
          <div className={`board__spacer-right ${getColorClassName("backlog-blue")}`} {...rightSpacerOffset.bindings} />
        </main>
      </div>
    );
  }

  const {firstVisibleColumnIndex, lastVisibleColumnIndex} = state;
  const columnColors = React.Children.map(children, (child) => child.props.color);

  const previousColumnIndex = firstVisibleColumnIndex > 0 ? firstVisibleColumnIndex - 1 : columnsCount - 1;
  const nextColumnIndex = lastVisibleColumnIndex === columnsCount - 1 ? 0 : firstVisibleColumnIndex + 1;

  const handlePreviousClick = () => {
    boardRef.current!.children[previousColumnIndex + 1].scrollIntoView({inline: "start", behavior: "smooth"});
  };

  const handleNextClick = () => {
    boardRef.current!.children[nextColumnIndex + 1].scrollIntoView({inline: "start", behavior: "smooth"});
  };

  return (
    <>
      <style>{`.board { --board__columns: ${columnsCount} }`}</style>
      <BoardHeader currentUserIsModerator={currentUserIsModerator} />
      <InfoBar />
      <MenuBars showPreviousColumn={state.showPreviousButton} showNextColumn={state.showNextButton} onPreviousColumn={handlePreviousClick} onNextColumn={handleNextClick} />
      <HotkeyAnchor />
      <main className={classNames("board", dragActive && "board--dragging")} ref={boardRef}>
        <div
          className={`board__spacer-left ${getColorClassName(columnColors[0])} ${currentUserIsModerator && moderating ? "board__spacer--moderation-isActive" : ""}`}
          {...leftSpacerOffset.bindings}
        />
        {children}
        <div
          className={`board__spacer-right  ${currentUserIsModerator && moderating ? "board__spacer--moderation-isActive" : ""} ${getColorClassName(
            columnColors[columnColors.length - 1]
          )}`}
          {...rightSpacerOffset.bindings}
        />
      </main>
    </>
  );
};
