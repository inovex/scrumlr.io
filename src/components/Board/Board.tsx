import {Children, useEffect, useRef, useState} from "react";
import {ColumnProps} from "components/Column";
import {MenuBars} from "components/MenuBars";
import {BoardHeader} from "components/BoardHeader";
import "./Board.scss";
import {HotkeyAnchor} from "components/HotkeyAnchor";
import CustomDragLayer from "./CustomDragLayer";

export interface BoardProps {
  children: React.ReactElement<ColumnProps> | React.ReactElement<ColumnProps>[];
  currentUserIsModerator: boolean;
}

export interface BoardState {
  showNextButton: boolean;
  showPreviousButton: boolean;
}

export interface ColumnState {
  firstVisibleColumnIndex: number;
  lastVisibleColumnIndex: number;
}

export const BoardComponent = ({children, currentUserIsModerator}: BoardProps) => {
  const [state, setState] = useState<BoardState & ColumnState>({
    firstVisibleColumnIndex: 0,
    lastVisibleColumnIndex: Children.count(children),
    showNextButton: false,
    showPreviousButton: false,
  });

  const [columnState, setColumnState] = useState<ColumnState>({
    firstVisibleColumnIndex: 0,
    lastVisibleColumnIndex: Children.count(children),
  });

  const boardRef = useRef<HTMLDivElement>(null);
  const columnVisibilityStatesRef = useRef<boolean[]>([]);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);

  const columnsCount = Children.count(children);

  useEffect(() => {
    const board = boardRef.current;

    // disconnect the previous observer, if there is one
    if (intersectionObserverRef.current !== null) {
      intersectionObserverRef.current.disconnect();
    }

    if (board) {
      // initialize column visibility states
      columnVisibilityStatesRef.current = new Array(Children.count(children));
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
          const index = Array.prototype.indexOf.call(board.children, entry.target);
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
      for (let i = 0; i < domChildren.length; i += 1) {
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
        <MenuBars showPreviousColumn={false} showNextColumn={false} onPreviousColumn={() => {}} onNextColumn={() => {}} />
        <HotkeyAnchor />
        <main className="board" ref={boardRef} />
      </div>
    );
  }

  const handlePreviousClick = () => {
    boardRef.current!.children[state.firstVisibleColumnIndex - 1].scrollIntoView({inline: "start", behavior: "smooth"});
  };

  const handleNextClick = () => {
    boardRef.current!.children[state.lastVisibleColumnIndex].scrollIntoView({inline: "start", behavior: "smooth"});
  };

  return (
    <>
      <style>{`.board { --board__columns: ${columnsCount} }`}</style>
      <BoardHeader currentUserIsModerator={currentUserIsModerator} />
      <MenuBars showPreviousColumn={state.showPreviousButton} showNextColumn={state.showNextButton} onPreviousColumn={handlePreviousClick} onNextColumn={handleNextClick} />
      <HotkeyAnchor />

      <main className="board" ref={boardRef}>
        {children}
        <CustomDragLayer />
      </main>
    </>
  );
};
