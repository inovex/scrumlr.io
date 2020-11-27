import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { useSelector } from 'react-redux';
import LoadingScreen from "components/LoadingScreen/LoadingScreen";
import {useEffect} from "react";
import {joinBoard} from "../../api/board";
import {ApplicationState} from "../../types/store";
import {addCard, deleteCard} from "../../api/card";

export interface BoardProps extends RouteComponentProps<{id: string}> {}

function Board(props: BoardProps) {
    useEffect( () => {
        const boardId = props.match.params.id;
        joinBoard(boardId);
    }, [ props.match.params.id ]);

    const state: any = useSelector((state: ApplicationState) => ({
        board: state.board,
        cards: state.cards,
        users: state.users.all
    }));

    const onAddCard = () => {
        addCard(props.match.params.id, 'Test');
    }

    const onDeleteCard = (id: string) => {
        deleteCard(props.match.params.id, id);
    }

    if (state.board.status === 'pending') {
        return <LoadingScreen/>;
    } else if (state.board.status === 'ready') {
        return (
            <ul>
                <li>{ JSON.stringify(state.board.data) }</li>
                <li>
                    <ul>
                        {state.cards.map((card: any) => <li key={card.id}>
                            {JSON.stringify(card)}
                            <button onClick={() => { onDeleteCard(card.id) }}>Delete Card</button>
                        </li>)}
                    </ul>
                </li>
                <li>{ JSON.stringify(state.users) }</li>
                <button onClick={onAddCard}>Add Card</button>
            </ul>);
    } else {
        return <LoadingScreen/>;
    }
}

export default Board;