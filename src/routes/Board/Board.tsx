import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { useSelector } from 'react-redux';
import LoadingScreen from "components/LoadingScreen/LoadingScreen";
import {useEffect} from "react";
import {ApplicationState} from "../../types/store";
import store from "../../store/store";
import {ActionFactory} from "../../store/action";


export interface BoardProps extends RouteComponentProps<{id: string}> {}

function Board(props: BoardProps) {
    useEffect( () => {
        const boardId = props.match.params.id;
        store.dispatch(ActionFactory.joinBoard(boardId));

        return () => {
            store.dispatch(ActionFactory.leaveBoard());
        }
    }, [ props.match.params.id ]);

    const state: any = useSelector((state: ApplicationState) => ({
        board: state.board,
        notes: state.notes,
        users: state.users.all
    }));

    const onAddNote = () => {
        store.dispatch(ActionFactory.addNote(props.match.params.id, 'Test'));
    }

    const onDeleteNote = (id: string) => {
        store.dispatch(ActionFactory.deleteNote(id));
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
            </ul>);
    } else {
        return <LoadingScreen/>;
    }
}

export default Board;