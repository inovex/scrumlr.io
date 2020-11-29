import {BoardState} from "../../types/store";
import {ActionType, ReduxAction} from "../action";
import isEqual from 'lodash/isEqual';

export const boardReducer = (state: BoardState = { status: 'unknown' }, action: ReduxAction): BoardState => {
    switch (action.type) {
        case ActionType.InitializeBoard: {
            return {
                status: 'ready',
                data: action.board
            };
        }
        case ActionType.EditBoard: {
            return {
                status: state.status,
                data: {
                    ...state.data!,
                    ...action.board,
                    dirty: true
                }
            }
        }
        case ActionType.AddColumn: {
            return {
                status: state.status,
                data: {
                    ...state.data!,
                    columns: [
                        ...state.data?.columns,
                        {
                            name: action.name,
                            hidden: action.hidden
                        }
                    ],
                    dirty: true
                }
            };
        }
        case ActionType.EditColumn: {
            const newColumns = [ ...state.data!.columns ];
            const columnIndex = newColumns.findIndex((column) => column.id === action.columnId);
            const column = newColumns[columnIndex];
            newColumns.splice(columnIndex, 1, {
                ...column,
                name: action.name || column.name,
                hidden: action.hidden === undefined ? column.hidden : action.hidden
            });
            return {
                status: state.status,
                data: {
                    ...state.data!,
                    columns: newColumns,
                    dirty: true
                }
            };
        }
        case ActionType.DeleteColumn: {
            const newColumns = [ ...state.data?.columns ];
            const columnIndex = newColumns.findIndex((column) => column.id === action.columnId);
            newColumns.splice(columnIndex, 1);
            return {
                status: state.status,
                data: {
                    ...state.data!,
                    columns: newColumns,
                    dirty: true
                }
            };
        }
        case ActionType.UpdatedBoard: {
            if (!state.data?.dirty) {
                return {
                    status: state.status,
                    data: action.board
                }
            }

            const stateColumns = state.data.columns
                .map((column) => ({ name: column.name, hidden: column.hidden }))
                .sort((a, b) => a.name.localeCompare(b.name));
            const actionColumns = action.board.columns
                .map((column) => ({ name: column.name, hidden: column.hidden }))
                .sort((a, b) => a.name.localeCompare(b.name));

            // check if current model from server equals local copy
            if (
                (action.board.name === undefined || state.data.name === action.board.name) &&
                (action.board.joinConfirmationRequired === undefined || state.data.joinConfirmationRequired === action.board.joinConfirmationRequired) &&
                (action.board.encryptedContent === undefined || state.data.encryptedContent === action.board.encryptedContent) &&
                (action.board.showContentOfOtherUsers === undefined || state.data.showContentOfOtherUsers === action.board.showContentOfOtherUsers) &&
                (action.board.showAuthors === undefined || state.data.showAuthors === action.board.showAuthors) &&
                (action.board.timerUTCEndTime === undefined || state.data.timerUTCEndTime === action.board.timerUTCEndTime) &&
                (action.board.expirationUTCTime === undefined || state.data.expirationUTCTime === action.board.expirationUTCTime) &&
                (action.board.voting === undefined || state.data.voting === action.board.voting) &&
                (action.board.showVotesOfOtherUsers === undefined || state.data.showVotesOfOtherUsers === action.board.showVotesOfOtherUsers) &&
                (action.board.voteLimit === undefined || state.data.voteLimit === action.board.voteLimit) &&
                isEqual(stateColumns, actionColumns)
            ) {
                return {
                    status: state.status,
                    data: action.board
                }
            }

            return state;
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