import React, {useEffect, useRef} from 'react';
import './Board.scss';
import {getColorClassName} from "../../constants/colors";
import {ColumnProps} from "../Column/Column";

export interface BoardProps {
    children: React.ReactElement<ColumnProps> | React.ReactElement<ColumnProps>[];
}

const Board = ({ children }: BoardProps) => {
    let columns: boolean[] = [];

    useEffect(() => {
        const board: HTMLDivElement = boardRef.current!;

        columns = new Array(board.childElementCount - 2);
        columns.fill(false);

        const observerOptions = {
            root: boardRef.current,
            rootMargin: '0px',
            threshold: 1.0
        }

        const observerCallback: IntersectionObserverCallback = (entries) => {
            entries.forEach((entry) => {
                const index = Array.prototype.indexOf.call(board.children, entry.target) - 1;
                columns[index] = entry.isIntersecting;
            })
        }

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        const children = board.children;
        for (let i = 1; i < children.length - 1; i++) {
            observer.observe(children[i]);
        }

        return () => {
            observer.disconnect();
        }
    }, []);

    const boardRef = useRef<HTMLDivElement>(null);
    const colors = React.Children.map(children, (child) => child.props.color);

    if (!children || React.Children.count(children) === 0) {
        return <div className="board--empty">Empty board</div>;
    }

    const handlePreviousClick = () => {
        const firstVisibleColumnIndex = columns.findIndex((value) => value);
        const scrollToIndex = firstVisibleColumnIndex > 0 ? firstVisibleColumnIndex : colors.length;
        boardRef.current!.children[scrollToIndex].scrollIntoView({ inline: 'start', behavior: 'smooth' });
    }

    const handleNextClick = () => {
        if (columns[columns.length - 1]) {
            boardRef.current!.children[1].scrollIntoView({ inline: 'start', behavior: 'smooth'});
        } else {
            const firstVisibleColumnIndex = columns.findIndex((value) => value);
            const scrollToIndex = firstVisibleColumnIndex <= colors.length - 1 ? firstVisibleColumnIndex + 2 : 1;
            boardRef.current!.children[scrollToIndex].scrollIntoView({ inline: 'start', behavior: 'smooth' });
        }
    }

    return (
        <>
            <style>
                {`.board { --board__columns: ${React.Children.count(children)} }`}
            </style>
            <button className="board__navigation-left" onClick={handlePreviousClick}>Previous</button>
            <div className="board" ref={boardRef}>
                <div className={`board__spacer-left ${getColorClassName(colors[0])}`} />
                    {children}
                <div className={`board__spacer-right ${getColorClassName(colors[colors.length - 1])}`} />
            </div>
            <button className="board__navigation-right" onClick={handleNextClick}>Next</button>
        </>
    )
};

export default Board;