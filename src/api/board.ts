import {callAPI} from "./index";
import {Color} from "constants/colors";

export const BoardAPI = {
    /**
     * Creates a board with the specified parameters and returns the board id.
     *
     * @param columns the definition of the columns
     * @param name the board name
     *
     * @returns the board id of the created board
     */
    createBoard: (columns: { name: string, hidden: boolean, color: Color }[], name?: string) => {
        return callAPI<{ columns: { name: string, hidden: boolean }[], name?: string }, string>('createBoard', { columns, name });
    },

    /**
     * Create join request for a board session.
     * The return value might have the status `accepted` (user is permitted to join the board), `rejected` (the join
     * request of the user was rejected by an admin) or `pending`. If the state is pending the response will include
     * the reference on the join request state in the attribute `joinRequestReference`.
     *
     * @param boardId the board id
     *
     * @returns `true` if the operation succeeded or throws an error otherwise
     */
    joinBoard: (boardId: string) => {
        return callAPI<{ boardId : string }, { status: 'accepted' | 'rejected' | 'pending', joinRequestReference?: string }>('joinBoard', { boardId});
    },
    acceptJoinRequest: (boardId: string, userId: string) => {
        return callAPI<{board: string, user: string}, boolean>('acceptUser', {board: boardId, user: userId});
    },
    rejectJoinRequest: (boardId: string, userId: string) => {
        return callAPI<{board: string, user: string}, boolean>('rejectUser', {board: boardId, user: userId});
    }
}