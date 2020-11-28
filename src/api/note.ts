import {callAPI} from "./index";

export const NoteAPI = {
    addNote: (boardId: string, text: string) => {
        return callAPI<{ boardId: string, text: string }, boolean>('addNote', { boardId, text });
    },
    deleteNote: (boardId: string, noteId: string) => {
        return callAPI<{ boardId: string, noteId: string}, boolean>('deleteNote', { boardId, noteId });
    },
    editNote: (boardId: string, noteId: string, text: string) => {
        return callAPI<{ boardId: string, noteId: string, text: string}, boolean>('editNote', { boardId, noteId, text });
    }
}