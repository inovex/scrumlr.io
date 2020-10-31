import React from 'react';
import './Board.scss';
import {getColorClassName} from "../constants/colors";

const Board = ({ children }: any) => {
    const colors = React.Children.map(children, (child) => child.props.color);

    return (
        <>
            <style>
                {`.board { --board__columns: ${React.Children.count(children)} }`}
            </style>
            <div className="board">
                <div className={`board__spacer-left ${getColorClassName(colors[0])}`} />
                    {children}
                <div className={`board__spacer-right ${getColorClassName(colors[colors.length - 1])}`} />
            </div>
        </>
    )
};

export default Board;