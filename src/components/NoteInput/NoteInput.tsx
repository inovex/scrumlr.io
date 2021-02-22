import React from 'react';
import './NoteInput.scss';
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import Input from '@material-ui/core/Input';
import store from "../../store";
import {ActionFactory} from "../../store/action";

export interface NoteInputProps {
    children?: React.ReactNode;
    id? : string;
}

const NoteInput = ({id} : NoteInputProps) => {
    let noteText = "";
    function handleChangeNotetext(e: any) {
        const newText = (e.target as HTMLInputElement).value;
        noteText = newText;
    }
    const onAddNote = () => {
        store.dispatch(ActionFactory.addNote(id!, noteText));
    }

    return (

        <div className='note-input'>
        <Input
            className='note-input__text'
            defaultValue="Add your note..."
            type='text'
            onChange={handleChangeNotetext}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                onAddNote();
                }
            }}
            inputProps={{
                maxLength: 20
            }}
        />
        <PlusIcon onClick={onAddNote} className="note-input__icon"/>
        </div> 
    );
};
export default NoteInput;