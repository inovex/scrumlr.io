import './Note.scss';
import avatar from 'assets/avatar.png';
import { useSelector } from 'react-redux';
import {ApplicationState} from "types/store";
import classNames from 'classnames';
import Parse from 'parse';
import store from "store";
import {ActionFactory} from "store/action";

export interface NoteProps {
    text: string;
    authorId: string; 
    noteId: string;
}

const Note = ({text, authorId, noteId } : NoteProps) => {

    const state = useSelector((state: ApplicationState) => ({
        board: state.board,
        notes: state.notes,
        users: state.users
    }));

    const onDeleteNote = () => {
        if (Parse.User.current()?.id === authorId) {
            store.dispatch(ActionFactory.deleteNote(noteId!));
        }
    }

    return (
        <li className={classNames('note', { 'note--own-card': Parse.User.current()?.id === authorId })}>      
            <p className="note__text">{text}</p>
            <footer className="note__footer">
                <figure className="note__author" aria-roledescription="author">
                    <img className="note__author-image" src={avatar} alt="User"/>
                    <figcaption className="note__author-name">{state.users.all.filter((user) => user.id === authorId)[0]?.displayName}</figcaption>
                </figure>
            </footer>
            <button className={classNames('note__delete-button', {'note__delete-button--visible': Parse.User.current()?.id === authorId})} onClick={onDeleteNote}>Delete Note</button>
        </li>
    );
};
export default Note;