import React from 'react';
import './NoteInput.scss';
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import store from "store";
import {ActionFactory} from "store/action";
import { InputAdornment, createStyles, withStyles, Theme, FilledInput} from '@material-ui/core';

export interface NoteInputProps {
    columnId : string;
}

const CustomInput = withStyles((theme: Theme) => 
    createStyles({
        root: {
            borderRadius: 20,
            height: 40,
            width: '100%',
            backgroundColor: '#EDEFF2',
            marginTop: 16,
            marginBottom: 32, 
            '&.MuiFilledInput-underline::before , &.MuiFilledInput-underline::after': {
                display: 'none',
            },
            '&:hover , &.Mui-focused': {
                backgroundColor: 'white',
                boxShadow: '0 6px 9px 0 rgba(0,87,255,0.16)',
            },        
        },
        input: {
            color: 'black',
            fontSize: 14,
            fontWeight: 'bold', 
            lineHeight: 24, 
            letterSpacing: 0.25, 
            padding: '10px 20px 10px 20px',
            // Use the system font instead of the default Roboto font.
            fontFamily: [
                'Raleway',
                'sans-serif',
            ].join(','),
            '& .MuiFilledInput-underline:before': {
                borderBottomColor: 'green',
                borderBottom: 0,
                position: 'relative',
                left: 20,
            },
        },
        '@media (prefers-color-scheme: dark)': {
            root: {
                backgroundColor: '#4C5566',
                '&:hover , &.Mui-focused': {
                    backgroundColor: '#4C5566',
                    boxShadow: '0 6px 9px 0 #232323',
                },  
            },
            input: {
                color: 'white',
            },
        },
    }),
)(FilledInput);

const NoteInput = ({columnId} : NoteInputProps) => {
    const [value, setValue] = React.useState("");

    function handleChangeNotetext(e: React.ChangeEvent <HTMLInputElement>) {
        setValue(e.target.value);
    }
    const onAddNote = () => {
        if (value) {
            store.dispatch(ActionFactory.addNote(columnId!, value));
            setValue("");
        } 
    }

    return (
        <CustomInput
            placeholder="Add your note..."
            type='text'
            value={value}
            onChange={handleChangeNotetext}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                    onAddNote();
                }
            }}
            endAdornment={
                <InputAdornment position="end">
                    <PlusIcon onClick={onAddNote} className="note-input__icon"/>
                </InputAdornment>
            }
        />
    );
};
export default NoteInput;