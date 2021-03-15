import { useSelector } from 'react-redux';
import LoadingScreen from "components/LoadingScreen/LoadingScreen";
import BoardComponent from "components/Board/Board";
import Column from "components/Column/Column";
import {ApplicationState} from "types/store";
import store from "store";
import {ActionFactory} from "store/action";
import Parse from 'parse';

function Board() {

    const state = useSelector((state: ApplicationState) => ({
        board: state.board,
        joinRequests: state.joinRequests,
        users: state.users
    }));

    let waitingUser;
    if (state.users.admins.find(user => user.id === Parse.User.current()!.id) !== undefined) {
        const pendingJoinRequests = state.joinRequests.filter(joinRequest => joinRequest.status === 'pending');
        if (pendingJoinRequests && pendingJoinRequests.length > 0) {
            waitingUser = (<div>
                {JSON.stringify(pendingJoinRequests[0])}
                <button onClick={_ => store.dispatch(ActionFactory.acceptJoinRequest(pendingJoinRequests[0].id, pendingJoinRequests[0].boardId, pendingJoinRequests[0].userId))}>Accept</button>
                <button onClick={_ => store.dispatch(ActionFactory.rejectJoinRequest(pendingJoinRequests[0].id, pendingJoinRequests[0].boardId, pendingJoinRequests[0].userId))}>Reject</button>
            </div>);
        }
    }
    var boardstatus = "Public Session"
    var joinConfirmationRequired = state.board.data?.joinConfirmationRequired;
    var accessCode = state.board.data?.accessCode;
    if (joinConfirmationRequired === true || (accessCode !== undefined && accessCode !== "") ) {
        boardstatus = "Private Session"
    } 

    if (state.board.status === 'pending') {
        return <LoadingScreen/>;
    } else if (state.board.status === 'ready') {
        return (
            <>    
                {waitingUser}
                <BoardComponent name={state.board.data!.name} boardstatus={boardstatus}>
                        {state.board.data!.columns.map((column:any) => (
                            <Column color="pink" key={column.id} columnId={column.id}/>
                        ))}
                </BoardComponent>
            </>
        )
    } else {
        return <LoadingScreen/>;
    }
}
export default Board;