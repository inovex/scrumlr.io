import React from 'react';
import './Column.scss';
import {Color, getColorClassName} from "../../constants/colors";

export interface ColumnProps {
    color: Color;
    children?: React.ReactNode;
}

const Column = ({ color, children } : ColumnProps) => {
    return (
        <section className={`column ${getColorClassName(color)}`}>
            <div className="column__content">
                {children}
            </div>
        </section>
    );
};
export default Column;