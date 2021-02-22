import React from 'react';
import './Note.scss';
import avatar from 'assets/avatar.png';
import { useSelector } from 'react-redux';
import {ApplicationState} from "../../types/store";

export interface NoteProps {
    text: String;
    authorId: String; 
}

const Note = ({text, authorId } : NoteProps) => {

    const state = useSelector((state: ApplicationState) => ({
        board: state.board,
        notes: state.notes,
        users: state.users
    }));

    return (
        <div className="note">
            <div className="note__indicator"></div>
            <p className="note__text">{text}</p>
            <div className="note__author">
                <img className="note__author-image" src={avatar} alt="User"/>
                <p className="note__author-name">{state.users.all.filter((user) => user.id === authorId)[0].displayName}</p>
            </div>
        </div>
    );
};
export default Note;
