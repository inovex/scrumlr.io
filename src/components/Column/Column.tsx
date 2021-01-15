import React from 'react';
import './Column.scss';
import {Color, getColorClassName} from "constants/colors";
import NoteInput from "components/NoteInput/NoteInput";
// <link href="https://static.inovex.de/css/raleway.css" rel="stylesheet"></link>

export interface ColumnProps {
    color: Color;
    children?: React.ReactNode;
}

const Column = ({ color, children } : ColumnProps) => {
    return (
        <section className={`column ${getColorClassName(color)}`}>
            <div className="column__content">
                <div className="column__header">
                    <h1 className="column__header-text">{children}</h1>
                    <p className="column__header-card-number">5</p>
                </div>
                <NoteInput/>
            </div>
        </section>
    );
};
export default Column;