import './Column.scss';
import {Color, getColorClassName} from "constants/colors";
import NoteInput from "components/NoteInput/NoteInput";
import React from "react";

export interface ColumnProps {
    id: string;
    name: string;
    color: Color;
    children?: React.ReactNode;
}

const Column = ({ id, name, color, children } : ColumnProps) => {
    return (
        <section className={`column ${getColorClassName(color)}`}>
            <div className="column__content">
                <header className="column__header">
                    <div className="column__header-title">
                        <h2 className="column__header-text">{name}</h2>
                        <span className="column__header-card-number">{React.Children.count(children)}</span>
                    </div>
                    <NoteInput columnId={id}/>
                </header>
                <div className="column__notes-wrapper">
                    <ul className="column__note-list">
                        {notesInColumn.map((note:any, index:number) =>
                            <Note key={note.id} text={note.text} authorId={note.author}/>
                        )}
                    </ul>
                </div>
            </div>
        </section>
    );
};
export default Column;