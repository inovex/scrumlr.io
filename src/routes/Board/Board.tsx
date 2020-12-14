import * as React from 'react';
import { useSelector } from 'react-redux';
import LoadingScreen from "components/LoadingScreen/LoadingScreen";
import BoardComponent from "components/Board/Board";
import Column from "components/Column/Column";
import {ApplicationState} from "types/store";

function Board() {

    const state = useSelector((state: ApplicationState) => ({
        board: state.board
    }));

    if (state.board.status === 'pending') {
        return <LoadingScreen/>;
    } else if (state.board.status === 'ready') {
        return (
            <BoardComponent>
                {
                    state.board.data!.columns.map((column) => (<Column color="pink">{column.name}</Column>))
                }
            </BoardComponent>);
    } else {
        return <LoadingScreen/>;
    }
}

export default Board;