import {SERVER_URL} from "../config";
import {Note} from "../types/note";

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
  addNote: async (boardId: string, columnId: string, text: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/boards/${boardId}/notes`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          column: columnId,
          text,
        }),
      });

      if (response.status === 201) {
        return (await response.json()) as Note;
      }

      throw new Error(`create note request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to create note with error: ${error}`);
    }
  },

  /**
   * Unstacks a note.
   * @param note contains noteId and parentId
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  unstackNote: (boardId: string) => {
    // TODO
  },

  /**
   * Drag and drop a note.
   * @param note contains noteId and parentId and optional a columnId
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  dragNote: (boardId: string) => {
    // TODO
  },

  /**
   * Deletes a note with the specified id.
   *
   * @param noteId the note id
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  deleteNote: (noteId: string) => {
    // TODO
  },

  /**
   * Edit a note with the specified id.
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  editNote: () => {
    // TODO
  },
};
