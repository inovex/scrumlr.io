import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { useSelector } from 'react-redux';
import LoadingScreen from "components/LoadingScreen/LoadingScreen";
import {ApplicationState} from "../../types/store";
import store from "../../store";
import {ActionFactory} from "../../store/action";

export interface BoardProps extends RouteComponentProps<{id: string}> {}

function Board(props: BoardProps) {

    const state: any = useSelector((state: ApplicationState) => ({
        board: state.board,
        notes: state.notes,
        users: state.users.all
    }));

    const onAddNote = () => {
        store.dispatch(ActionFactory.addNote(state.board.data.columns[0].id, 'Test'));
    }

    const onDeleteNote = (id: string) => {
        store.dispatch(ActionFactory.deleteNote(id));
    }

    const onAddColumn = () => {
        store.dispatch(ActionFactory.addColumn('New Column'));
    }

    const onEditColumn = () => {
        store.dispatch(ActionFactory.editColumn(state.board.data.columns[0].id, 'Changed Name'));
    }

    const onDeleteColumn = () => {
        store.dispatch(ActionFactory.deleteColumn(state.board.data.columns[0].id));
    }

    if (state.board.status === 'pending') {
        return <LoadingScreen/>;
    } else if (state.board.status === 'ready') {
        return (
            <ul>
                <li>{ JSON.stringify(state.board.data) }</li>
                <li>
                    <ul>
                        {state.notes.map((note: any, index: number) => <li key={index}>
                            {JSON.stringify(note)}
                            <button onClick={() => { onDeleteNote(note.id) }}>Delete Note</button>
                        </li>)}
                    </ul>
                </li>
                <li>{ JSON.stringify(state.users) }</li>
                <button onClick={onAddNote}>Add Note</button>
                <p>
                    <button onClick={onAddColumn}>Add Column</button>
                    <button onClick={onEditColumn}>Edit Column</button>
                    <button onClick={onDeleteColumn}>Delete Column</button>
                </p>
            </ul>);
    } else {
        return <LoadingScreen/>;
    }
}

export default Board;