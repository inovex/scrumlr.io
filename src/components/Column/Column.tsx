import './Column.scss';
import {Color, getColorClassName} from "constants/colors";
import NoteInput from "components/NoteInput/NoteInput";
import Note from "components/Note/Note";
import {ApplicationState} from "types/store";
import { useSelector } from 'react-redux';

export interface ColumnProps {
    color: Color;
    columnId: string;
}

const Column = ({ color, columnId } : ColumnProps) => {
    const state = useSelector((state: ApplicationState) => ({
        board : state.board,
        notes: state.notes,
        users: state.users 
    }));

    const notesInColumn = state.notes.filter((note) => note.columnId === columnId); 

    return (
        <section className={`column ${getColorClassName(color)}`}>
            <div className="column__content">
                <header className="column__header">
                    <div className="column__header-title">
                        <h2 className="column__header-text">{state.board.data?.columns.filter((column) => column.id === columnId)[0].name}</h2>
                        <span className="column__header-card-number">{notesInColumn.length}</span>
                    </div>
                    <NoteInput columnId={columnId}/>
                </header>
                <div className={"column__notes-wrapper"}>
                    <ul className="column__note-list">
                        {notesInColumn.map((note:any, index:number) =>
                            <Note key={note.id} text={note.text} authorId={note.author}/>
                        )}
                    </ul>
                </div>
            </div>
        </section>
    );
};
export default Column;