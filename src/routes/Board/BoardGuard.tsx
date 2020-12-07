import React, {useEffect} from 'react';
import store from "store";
import {ActionFactory} from "store/action";
import {RouteComponentProps} from "react-router";
import Board from "./Board";

// Redux Stuff
import {ApplicationState} from "types/store";
import {useSelector} from "react-redux";

//Additional components
import LoadingScreen from "components/LoadingScreen/LoadingScreen";

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
        return (<Board {...props}/>);
    } else if (boardStatus === 'rejected') {
        return (<LoadingScreen info='You have been rejected.'/>);
    } else {
        return (<LoadingScreen info='Waiting for approval.'/>);
    }
}

export default BoardGuard;