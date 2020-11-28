import {AnyAction} from "redux";
import {BoardState} from "../../types/store";

export const boardReducer = (state: BoardState = { status: 'pending' }, action: AnyAction): BoardState => {
    switch (action.type) {
        case '@@SCRUMLR/updateBoard':
        case '@@SCRUMLR/initBoard': {
            return {
                status: 'ready',
                data: action.payload.board
            };
        }
        case '@@SCRUMLR/joinBoard': {
            return {
                status: 'pending'
            }
        }
        case '@@SCRUMLR/initCards': {
            return {
                ...state
            }
        }
    }
    return state;
};