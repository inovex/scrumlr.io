import {callAPI} from "./index";

export const ColumnAPI = {
    addColumn: (boardId: string, name: string) => {
        return callAPI<{ boardId: string, name: string }, boolean>('addColumn', { boardId, name });
    },
    deleteColumn: (boardId: string, columnId: string) => {
        return callAPI<{ boardId: string, columnId: string }, boolean>('deleteColumn', { boardId, columnId });
    },
    editColumn: (boardId: string, columnId: string, name: string) => {
        return callAPI<{ boardId: string, columnId: string, name: string }, boolean>('editColumn', { boardId, columnId, name });
    }
}