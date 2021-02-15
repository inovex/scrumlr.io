import React from 'react';
import './Note.scss';
import avatar from 'assets/avatar.png';

export interface ColumnProps {
    text: String;
    author: String; 
}

const Note = ({text, author } : ColumnProps) => {
    return (
        <div className="note">
            <div className="note__indicator"></div>
            <p className="note__text">{text}</p>
            <div className="note__author">
                <img className="note__author-image" src={avatar} alt="User"/>
                <p className="note__author-name">{author}</p>
            </div>
        </div>
    );
};
export default Note;
