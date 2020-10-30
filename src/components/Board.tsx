import React from 'react';
import './Board.scss';

const Board = ({ children }: any) => {
    console.log();

    return (
        <div className="board">
            <style>
                {`.board { --real-columns: ${React.Children.count(children)} }`}
            </style>
            {children}
        </div>
    );
};
export default Board;