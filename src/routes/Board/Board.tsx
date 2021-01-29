import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { useSelector } from 'react-redux';
import LoadingScreen from "components/LoadingScreen/LoadingScreen";
import BoardComponent from "components/Board/Board";
// import Column from "components/Column/Column";
import {useEffect} from "react";
import {ApplicationState} from "../../types/store";
import store from "../../store";
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

    //const state = useSelector((state: ApplicationState) => ({
    const state:any = useSelector((state: ApplicationState) => ({
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

    if (state.board.status === 'pending') {
        return <LoadingScreen/>;
    } else if (state.board.status === 'ready') {
        return (
            <>
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
                <button onClick={onAddNote}>Add Note</button>
            </ul>);
                <BoardComponent>
                    {
                        // state.board.data!.columns.map((column) => (<Column color="pink">{column.name}</Column>))
                    }
                </BoardComponent>);
            </>
        )
    } else {
        return <LoadingScreen/>;
    }
}
export default Board;