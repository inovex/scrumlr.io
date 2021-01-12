import {callAPI} from "./index";

export const NoteAPI = {
    /**
     * Adds a note to a board.
     *
     * @param boardId the board id
     * @param columnId the column id
     * @param text the note text
     *
     * @returns `true` if the operation succeeded or throws an error otherwise
     */
    addNote: (boardId: string, columnId: string, text: string) => {
        return callAPI<{ boardId: string, columnId: string, text: string }, boolean>('addNote', { boardId, columnId, text });
    },
    /**
     * Deletes a note with the specified id.
     *
     * @param noteId the note id
     *
     * @returns `true` if the operation succeeded or throws an error otherwise
     */
    deleteNote: (noteId: string) => {
        return callAPI<{ noteId: string}, boolean>('deleteNote', { noteId });
    },
    /**
     * Edit a note with the specified id.
     *
     * @param noteId the note id
     * @param text the new text to set (optional)
     *
     * @returns `true` if the operation succeeded or throws an error otherwise
     */
    editNote: (noteId: string, text?: string) => {
        return callAPI<{noteId: string, text?: string}, boolean>('editNote', { noteId, text });
    }
}