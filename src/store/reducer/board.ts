import {BoardState} from "../../types/store";
import {ActionType, ReduxAction} from "../action";

export const boardReducer = (state: BoardState = { status: 'unknown' }, action: ReduxAction): BoardState => {
    switch (action.type) {
        case ActionType.UpdateBoard:
        case ActionType.InitializeBoard: {
            return {
                status: 'ready',
                data: action.board
            };
        }
        case ActionType.PendingBoardAccessConfirmation:
        case ActionType.JoinBoard: {
            return {
                status: 'pending'
            }
        }
        case ActionType.PermittedBoardAccess: {
            return {
                status: 'accepted'
            }
        }
        case ActionType.RejectedBoardAccess: {
            return {
                status: 'rejected'
            }
        }
    }
    return state;
};