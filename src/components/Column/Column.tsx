import React from 'react';
import './Column.scss';
import {Color, getColorClassName} from "constants/colors";
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";

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
                <div className="note-input">
                    <p className="note-input__text">Add your note...</p>
                    <PlusIcon className="note-input__icon"/>
                </div>
            </div>
        </section>
    );
};
export default Column;