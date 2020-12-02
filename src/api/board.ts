import {callAPI} from "./index";

export const BoardAPI = {
    /**
     * Creates a board with the specified parameters and returns the board id.
     *
     * @param columns the definition of the columns
     * @param name the board name
     */
    createBoard: (columns: { name: string, hidden: boolean }[], name?: string) => {
        return callAPI<{ columns: { name: string, hidden: boolean }[], name?: string }, string>('createBoard', { columns, name });
    },

    /**
     * Create join request for a board session.
     * The return value might have the status `accepted` (user is permitted to join the board), `rejected` (the join
     * request of the user was rejected by an admin) or `pending`. If the state is pending the response will include
     * the reference on the join request state in the attribute `joinRequestReference`.
     *
     * Returns `true` if the operation succeeded or throws an Error otherwise.
     *
     * @param boardId the board id
     */
    joinBoard: (boardId: string) => {
        return callAPI<{ boardId : string }, { status: 'accepted' | 'rejected' | 'pending', joinRequestReference?: string }>('joinBoard', { boardId});
    }
}