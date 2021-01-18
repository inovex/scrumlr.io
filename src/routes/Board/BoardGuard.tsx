import React, {useEffect} from 'react';
import store from "store";
import {ActionFactory} from "store/action";
import {RouteComponentProps} from "react-router";
import Board from "./Board";
import {ApplicationState} from "types/store";
import {useSelector} from "react-redux";
import LoadingIndicator from "components/LoadingIndicator/LoadingIndicator";
import "./BoardGuard.scss";

export interface BoardGuardProps extends RouteComponentProps<{id: string}> {}

const BoardGuard = (props: BoardGuardProps) => {

    const boardStatus = useSelector((state: ApplicationState) => state.board.status);

    useEffect( () => {
        const boardId = props.match.params.id;
        store.dispatch(ActionFactory.joinBoard(boardId));

        return () => {
            store.dispatch(ActionFactory.leaveBoard());
        }
    }, [ props.match.params.id ]);

    if (boardStatus === 'accepted' || boardStatus === 'ready') {
        return (<Board/>);
    } else if (boardStatus === 'rejected') {
        return (<div className='board-guard'>
            <p className='board-guard__info'>You have been rejected.</p>
            <a href='/' className='board-guard__denied-link'>Return to homepage</a>
        </div>);
    } else {
        return (<div className='board-guard'>
            <LoadingIndicator/>
            <p className='board-guard__info'>Waiting for approval.</p>
        </div>);
    }
}

export default BoardGuard;