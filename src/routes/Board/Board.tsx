import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { useFirestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase';
import { ApplicationState } from 'store/ApplicationState';
import { useSelector } from 'react-redux';
import LoadingScreen from "components/LoadingScreen/LoadingScreen";
import BoardData from "../../types/BoardData";

export interface BoardProps extends RouteComponentProps<{id: string}> {}

function Board(props: BoardProps) {

    const boardId = props.match.params.id;

    useFirestoreConnect([
        {collection: 'boards', doc: boardId}
    ]);

    const board: BoardData = useSelector((state: ApplicationState) => state.firestore.data.boards && state.firestore.data.boards[boardId]);

    if (isLoaded(board)) {
        if (isEmpty(board)) {
            // PLACEHOLDER: BOARD NON EXISTENT
            return <div> Board non existent</div>;
        } else {
            // PLACEHOLDER: INSERT BOARD
            return <div>
                <h1>{board.topic} ({boardId})</h1>
                <span>Owner: {board.owner}</span>
                <br/>
                <span>Date: {board.date.toDate().toString()}</span>
            </div>;
        }
    } else {
        return <LoadingScreen/>;
    }
}

export default Board;