import React from 'react';
import './Column.scss';
import {Color, getColorClassName} from "constants/colors";
import NoteInput from "components/NoteInput/NoteInput";
import Note from "components/Note/Note";
import {ApplicationState} from "../../types/store";
import { useSelector } from 'react-redux';

export interface ColumnProps {
    color: Color;
    id?: string;
    children?: React.ReactNode;
}

const Column = ({ color, id, children } : ColumnProps) => {
    const state = useSelector((state: ApplicationState) => ({
        notes: state.notes,
        users: state.users 
    }));

    return (
        <section className={`column ${getColorClassName(color)}`}>
            <div className="column__content">
                <div className="column__header">
                    <h1 className="column__header-text">{children}</h1>
                    <p className="column__header-card-number">5</p>
                </div>
                <NoteInput id={id}/>

                {state.notes.filter((note) => note.columnId === id).map((note:any, index:number) =>
                    <Note text={note.text} authorId={state.users.all.filter((user) => user.id === note.author)[0].id}></Note>
                )}
            </div>
        </section>
    );
};
export default Column;