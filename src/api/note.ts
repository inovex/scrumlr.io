import {callAPI} from "./index";

export const NoteAPI = {
    /**
     * Adds a note to a board.
     *
     * Returns `true` if the operation succeeded or throws an Error otherwise.
     *
     * @param boardId the board id
     * @param columnId the column id
     * @param text the note text
     */
    addNote: (boardId: string, columnId: string, text: string) => {
        return callAPI<{ boardId: string, columnId: string, text: string }, boolean>('addNote', { boardId, columnId, text });
    },
    /**
     * Deletes a note with the specified id.
     *
     * Returns `true` if the operation succeeded or throws an Error otherwise.
     *
     * @param noteId the note id
     */
    deleteNote: (noteId: string) => {
        return callAPI<{ noteId: string}, boolean>('deleteNote', { noteId });
    },
    /**
     * Edit a note with the specified id.
     *
     * Returns `true` if the operation succeeded or throws an Error otherwise.
     *
     * @param noteId the note id
     * @param text the new text to set (optional)
     */
    editNote: (noteId: string, text?: string) => {
        return callAPI<{noteId: string, text?: string}, boolean>('editNote', { noteId, text });
    }
}