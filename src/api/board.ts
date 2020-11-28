import {callAPI} from "./index";

export const BoardAPI = {
    createBoard: () => {
        return callAPI<{}, string>('createBoard', {});
    },
    joinBoard: (boardId: string) => {
        return callAPI<{ boardId : string }, { status: 'accepted' | 'rejected' | 'pending', joinRequestReference?: string }>('joinBoard', { boardId});
    }
}