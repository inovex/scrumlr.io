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
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';

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

    function handleChangeName(e: any) {

    }

    const onAddNote = () => {
        store.dispatch(ActionFactory.addNote(state.board.data.columns[0].id, 'Test'));
    }
    const onAddNoteWithText = (text: string) => {
        store.dispatch(ActionFactory.addNote(state.board.data.columns[0].id, text));
    }
    const onDeleteNote = (id: string) => {
        store.dispatch(ActionFactory.deleteNote(id));
    }

    if (state.board.status === 'pending') {
        return <LoadingScreen/>;
    } else if (state.board.status === 'ready') {
        return (
            <>        
                <BoardComponent>
                    {
                        <>
                        <div className='new-board'>
                        <Input
                            className='new-board__input'
                            defaultValue="Test2"
                            type='text'
                            onChange={handleChangeName}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') {
                                onAddNoteWithText("Test2");
                                }
                            }}
                            inputProps={{
                                maxLength: 20
                            }}
                        />
                        <Button onClick={onAddNote}>Add Note</Button>
                        </div>                        

                                <ul>
                                    <li>{ JSON.stringify(state.board.data) }</li>
                                    <li>
                                        <ul>
                                            {state.notes.map((note: any, index: number) => 
                                            <li key={index}>
                                                {JSON.stringify(note)}
                                                <p>Text: {note.text}</p>
                                                <p>Author: {note.author}</p>
                                                <Button onClick={() => { onDeleteNote(note.id)}}>Delete Note</Button>
                                            </li>)}
                                        </ul>
                                    </li>
                                </ul>
                        

                        </>
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