import {callAPI} from "./index";

export const NoteAPI = {
    addNote: (boardId: string, columnId: string, text: string) => {
        return callAPI<{ boardId: string, columnId: string, text: string }, boolean>('addNote', { boardId, columnId, text });
    },
    deleteNote: (noteId: string) => {
        return callAPI<{ noteId: string}, boolean>('deleteNote', { noteId });
    },
    editNote: (noteId: string, text?: string, hidden?: boolean) => {
        return callAPI<{noteId: string, text?: string, hidden?: boolean}, boolean>('editNote', { noteId, text, hidden });
    }
}