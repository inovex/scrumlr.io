import React from 'react';
import './Column.scss';
import {Color, getColorClassName} from "constants/colors";
import NoteInput from "components/NoteInput/NoteInput";
import Note from "components/Note/Note";

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
                <Note text="Lorem ipsum dolor sit amet, consetetur sadipscing elitr." author="Jana Becker"></Note>
                <Note text="Far far away, behind the word mountains, far from the countries Vokalia and Consonantia." author="Johann Böhler"></Note>
                <Note text="Sed ut perspiciatis unde omnis iste natus error sit voluptatem." author="Nils Schacht"></Note>
            </div>
        </section>
    );
};
export default Column;