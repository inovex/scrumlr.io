import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { useSelector } from 'react-redux';
import LoadingScreen from "components/LoadingScreen/LoadingScreen";
import BoardComponent from "components/Board/Board";
import Column from "components/Column/Column";
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

    const state = useSelector((state: ApplicationState) => ({
        board: state.board,
        notes: state.notes,
        users: state.users.all
    }));

    if (state.board.status === 'pending') {
        return <LoadingScreen/>;
    } else if (state.board.status === 'ready') {
        return (
            <BoardComponent name="Test">
                {
                    state.board.data!.columns.map((column) => (<Column color="pink">{column.name}</Column>))
                }
            </BoardComponent>);
        
    } else {
        return <LoadingScreen/>;
    }
}

export default Board;