import React from 'react';
import './NoteInput.scss';
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";

export interface ColumnProps {
    children?: React.ReactNode;
}

const NoteInput = () => {
    return (
        <div className="note-input">
            <p className="note-input__text">Add your note...</p>
            <PlusIcon className="note-input__icon"/>
        </div>
    );
};
export default NoteInput;