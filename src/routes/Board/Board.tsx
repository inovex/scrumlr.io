import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { useFirestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase';
import { ApplicationState } from 'store/ApplicationState';
import { useSelector } from 'react-redux';
import LoadingScreen from "components/LoadingScreen/LoadingScreen";
import BoardData from "../../types/BoardData";
import BoardComponent from "components/Board/Board";
import Column from "components/Column/Column";

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
            return <BoardComponent>
                <Column color="blue">{board.topic} ({boardId})</Column>
                <Column color="purple">Owner: {board.owner}</Column>
                <Column color="violet">Date: {board.date.toDate().toString()}</Column>
                <Column color="pink">Delfin</Column>
                <Column color="blue">Elefant</Column>
                <Column color="purple">Fuchs</Column>
                <Column color="violet">Giraffe</Column>
                <Column color="pink">Hund</Column>
                <Column color="blue">Igel</Column>
            </BoardComponent>;

        }
    } else {
        return <LoadingScreen/>;
    }
}

export default Board;