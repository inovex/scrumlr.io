import {BoardState} from "../../types/store";
import {ActionType, ReduxAction} from "../action";

export const boardReducer = (state: BoardState = { status: 'pending' }, action: ReduxAction): BoardState => {
    switch (action.type) {
        case ActionType.UpdateBoard:
        case ActionType.InitializeBoard: {
            return {
                status: 'ready',
                data: action.board
            };
        }
        case ActionType.JoinBoard: {
            return {
                status: 'pending'
            }
        }
    }
    return state;
};