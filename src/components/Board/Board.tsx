import React, {useEffect, useRef, useState} from "react";
import {getColorClassName} from "constants/colors";
import {ColumnProps} from "components/Column/Column";
import {ReactComponent as RightArrowIcon} from "assets/icon-arrow-next.svg";
import {ReactComponent as LeftArrowIcon} from "assets/icon-arrow-previous.svg";
import MenuBars from "components/MenuBars/MenuBars";
import BoardHeader from "components/BoardHeader/BoardHeader";
import "./Board.scss";

export interface BoardProps {
  children: React.ReactElement<ColumnProps> | React.ReactElement<ColumnProps>[];
  name: string;
  boardstatus: string;
  currentUserIsModerator: boolean;
}

export interface BoardState {
  firstVisibleColumnIndex: number;
  lastVisibleColumnIndex: number;
}

const Board = ({children, name, boardstatus, currentUserIsModerator}: BoardProps) => {
  const [state, setState] = useState<BoardState>({firstVisibleColumnIndex: 0, lastVisibleColumnIndex: React.Children.count(children)});
  const boardRef = useRef<HTMLDivElement>(null);
  const columnVisibilityStatesRef = useRef<boolean[]>([]);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const board = boardRef.current;

    // disconnect the previous observer, if there is one
    if (intersectionObserverRef.current !== null) {
      intersectionObserverRef.current.disconnect();
    }

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
        setState({
          firstVisibleColumnIndex: columnVisibilityStates.findIndex((value) => value),
          lastVisibleColumnIndex: columnVisibilityStates.lastIndexOf(true),
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
  }, [children]);

  const columnsCount = React.Children.count(children);
  if (!children || columnsCount === 0) {
    return <div className="board--empty">Empty board</div>;
  }

  const {firstVisibleColumnIndex, lastVisibleColumnIndex} = state;
  const columnColors = React.Children.map(children, (child) => child.props.color);

  const showNextButton = lastVisibleColumnIndex < columnsCount - 1;
  const showPreviousButton = firstVisibleColumnIndex > 0;

  const previousColumnIndex = firstVisibleColumnIndex > 0 ? firstVisibleColumnIndex - 1 : columnsCount - 1;
  const nextColumnIndex = lastVisibleColumnIndex === columnsCount - 1 ? 0 : firstVisibleColumnIndex + 1;

  document.getElementById("menu-bars")?.classList.toggle("menu-bars--bottom", showPreviousButton || showNextButton);

  const handlePreviousClick = () => {
    boardRef.current!.children[previousColumnIndex + 1].scrollIntoView({inline: "start", behavior: "smooth"});
  };

  const handleNextClick = () => {
    boardRef.current!.children[nextColumnIndex + 1].scrollIntoView({inline: "start", behavior: "smooth"});
  };

  return (
    <>
      <style>{`.board { --board__columns: ${columnsCount} }`}</style>

      <BoardHeader name={name} boardstatus={boardstatus} currentUserIsModerator={currentUserIsModerator} />
      <MenuBars />

      {showPreviousButton && (
        <button className={`board__navigation board__navigation-prev ${getColorClassName(columnColors[previousColumnIndex])}`} onClick={handlePreviousClick} aria-hidden>
          <LeftArrowIcon className="board__navigation-arrow board__navigation-arrow-prev" />
        </button>
      )}

      <main className="board" ref={boardRef}>
        <div className={`board__spacer-left ${getColorClassName(columnColors[0])}`} />
        {children}
        <div className={`board__spacer-right ${getColorClassName(columnColors[columnColors.length - 1])}`} />
      </main>

      {showNextButton && (
        <button
          className={`board__navigation board__navigation-next ${getColorClassName(columnColors[(lastVisibleColumnIndex + 1) % columnColors.length])}`}
          onClick={handleNextClick}
          aria-hidden
        >
          <RightArrowIcon className="board__navigation-arrow board__navigation-arrow-next" />
        </button>
      )}
    </>
  );
};

export default Board;
