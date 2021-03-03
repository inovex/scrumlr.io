import React from 'react';
import './NoteInput.scss';
import {ReactComponent as PlusIcon} from "assets/icon-add.svg";
import store from "../../store";
import {ActionFactory} from "../../store/action";
import { InputAdornment, createStyles, withStyles, Theme, FilledInput, fade } from '@material-ui/core';

export interface NoteInputProps {
    columnId : string;
}

const BootstrapInput = withStyles((theme: Theme) =>
    createStyles({
        root: {
            'label + &': {
                marginTop: theme.spacing(3),
            },
        },
        input: {
            borderRadius: 4,
            position: 'relative',
            backgroundColor: theme.palette.common.white,
            border: '1px solid #ced4da',
            fontSize: 16,
            width: 'auto',
            padding: '10px 12px',
            transition: theme.transitions.create(['border-color', 'box-shadow']),
            // Use the system font instead of the default Roboto font.
            fontFamily: [
                '-apple-system',
                'BlinkMacSystemFont',
                '"Segoe UI"',
                'Roboto',
                '"Helvetica Neue"',
                'Arial',
                'sans-serif',
                '"Apple Color Emoji"',
                '"Segoe UI Emoji"',
                '"Segoe UI Symbol"',
            ].join(','),
            '&:focus': {
                boxShadow: `${fade(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
                borderColor: theme.palette.primary.main,
            },
        }, 
    }),
    )(FilledInput);

const NoteInput = ({columnId} : NoteInputProps) => {
    const [value, setValue] = React.useState<string>();
    // Parameter = Startwert, wenn parameter gegeben ist type reference nicht nötig

    function handleChangeNotetext(e: React.ChangeEvent <HTMLInputElement>) {
        setValue(e.target.value);
    }
    const onAddNote = () => {
        if (value) {
            store.dispatch(ActionFactory.addNote(columnId!, value!));
            setValue("");
        } 
    }

    return (
        <BootstrapInput
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