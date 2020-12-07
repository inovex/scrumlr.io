import {callAPI} from "./index";

export const BoardAPI = {
    createBoard: (columns: { name: string, hidden: boolean }[], name?: string) => {
        return callAPI<{ columns: { name: string, hidden: boolean }[], name?: string }, string>('createBoard', { columns, name });
    },
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