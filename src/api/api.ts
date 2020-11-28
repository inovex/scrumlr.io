import Parse from "parse";

const callApi = <RequestType, ResponseType>(endpoint: string, request: RequestType) => {
    return Parse.Cloud.run(endpoint, request) as Promise<ResponseType>;
}

export const Api = {
    createBoard: () => {
        return callApi<{}, string>('createBoard', {});
    },
    joinBoard: (boardId: string) => {
        return callApi<{ boardId : string }, { status: 'accepted' | 'rejected' | 'pending', joinRequestReference?: string }>('joinBoard', { boardId});
    },
    addNote: (boardId: string, text: string) => {
        return callApi<{ boardId: string, text: string }, boolean>('addNote', { boardId, text });
    },
    deleteNote: (boardId: string, noteId: string) => {
        return callApi<{ boardId: string, noteId: string}, boolean>('deleteNote', { boardId, noteId });
    },
    editNote: (boardId: string, noteId: string, text: string) => {
        return callApi<{ boardId: string, noteId: string, text: string}, boolean>('editNote', { boardId, noteId, text });
    }
}