import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { useFirestoreConnect, isLoaded, isEmpty } from 'react-redux-firebase';
import { ApplicationState } from 'store/ApplicationState';
import { useSelector } from 'react-redux';
import firebase from "firebaseSetup";
import LoadingScreen from "components/LoadingScreen/LoadingScreen";

interface BoardProps extends RouteComponentProps<{id: string}> {

}

function Board(props: BoardProps) {

    const boardId = props.match.params.id;

    useFirestoreConnect([
        {collection: 'boards', doc: boardId}
    ]);

    const board: {
        owner: string;
        topic: string;
        date: firebase.firestore.Timestamp;
        config: {
            private: boolean;
            encryption: boolean;
            maxVotes: number;
            multiVote: boolean;
            hideVotes: boolean;
            columnConfig?: {};
        };
    } = useSelector((state: ApplicationState) => state.firestore.data.boards && state.firestore.data.boards[boardId]);

    if (isLoaded(board)) {
        if (isEmpty(board)) {
            return <div> Board non existent</div>;
        } else {
            return <div>
                <h1>{board.topic} ({boardId})</h1>
                <span>Owner: {board.owner}</span>
                <br/>
                <span>Date: {board.date.toDate().toString()}</span>
            </div>;
        }
    }
    return <LoadingScreen/>;
}

export default Board;