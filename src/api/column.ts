import {callAPI} from "./index";

export const ColumnAPI = {
    addColumn: (boardId: string, name: string, hidden: boolean = false) => {
        return callAPI<{ boardId: string, name: string, hidden: boolean }, boolean>('addColumn', { boardId, name, hidden });
    },
    deleteColumn: (boardId: string, columnId: string) => {
        return callAPI<{ boardId: string, columnId: string }, boolean>('deleteColumn', { boardId, columnId });
    },
    editColumn: (boardId: string, columnId: string, name?: string, hidden?: boolean) => {
        return callAPI<{ boardId: string, columnId: string, name?: string, hidden?: boolean }, boolean>('editColumn', { boardId, columnId, name, hidden });
    }
}