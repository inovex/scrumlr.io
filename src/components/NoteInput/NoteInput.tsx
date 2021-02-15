import React from 'react';
import './NoteInput.scss';
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import Input from '@material-ui/core/Input';

export interface ColumnProps {
    children?: React.ReactNode;
}

const NoteInput = () => {
    return (
        <div className="note-input">
            <Input 
                className="note-input__text"
                defaultValue = "Add your note..."
                type = 'text'
            />
            <PlusIcon className="note-input__icon"/>
        </div>
    );
};
export default NoteInput;