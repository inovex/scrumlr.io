import './Note.scss';
import avatar from 'assets/avatar.png';
import { useSelector } from 'react-redux';
import {ApplicationState} from "../../types/store";
import classNames from 'classnames';
import Parse from 'parse';

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
        <li className={classNames('note', { 'note--own-card': Parse.User.current()?.id === authorId })}>      
            <p className="note__text">{text}</p>
            <footer>
                <figure className="note__author" aria-roledescription="author">
                    <img className="note__author-image" src={avatar} alt="User"/>
                    <figcaption className="note__author-name">{state.users.all.filter((user) => user.id === authorId)[0]?.displayName}</figcaption>
                </figure>
            </footer>
        </li>
    );
};
export default Note;
