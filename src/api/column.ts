import {callAPI} from "./index";

export const ColumnAPI = {
    /**
     * Adds a column with the specified name an configurations to a board.
     *
     * @param boardId the board id
     * @param name the column name
     * @param hidden flag whether the column should be displayed to all users or hidden from basic users
     *
     * @returns `true` if the operation succeeded or throws an Error otherwise
     */
    addColumn: (boardId: string, name: string, hidden: boolean = false) => {
        return callAPI<{ boardId: string, name: string, hidden: boolean }, boolean>('addColumn', { boardId, name, hidden });
    },
    /**
     * Deletes a column with the specified id.
     *
     * @param boardId the board id
     * @param columnId the column id
     *
     * @returns `true` if the operation succeeded or throws an Error otherwise
     */
    deleteColumn: (boardId: string, columnId: string) => {
        return callAPI<{ boardId: string, columnId: string }, boolean>('deleteColumn', { boardId, columnId });
    },
    /**
     * Edit a column with the specified id.
     *
     * @param boardId the board id
     * @param columnId the column id
     * @param name new name to set (optional)
     * @param hidden flag to set whether this columns should be visible to all basic users (optional)
     *
     * @returns `true` if the operation succeeded or throws an Error otherwise
     */
    editColumn: (boardId: string, columnId: string, name?: string, hidden?: boolean) => {
        return callAPI<{ boardId: string, columnId: string, name?: string, hidden?: boolean }, boolean>('editColumn', { boardId, columnId, name, hidden });
    }
}