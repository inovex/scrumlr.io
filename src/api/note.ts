import {SERVER_HTTP_URL} from "../config";
import {EditNote, Note} from "../types/note";

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
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${boardId}/notes`, {
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
   * Deletes a note with the specified id.
   *
   * @param noteId the note id
   * @param deleteStack delete entire stack of note
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  deleteNote: async (board: string, noteId: string, deleteStack: boolean) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${board}/notes/${noteId}`, {
        method: "DELETE",
        credentials: "include",
        body: JSON.stringify({
          deleteStack,
        }),
      });

      if (response.status === 204) {
        return;
      }

      throw new Error(`delete note request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to delete note with error: ${error}`);
    }
  },

  /**
   * Edit a note with the specified id.
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  editNote: async (board: string, note: string, request: EditNote) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${board}/notes/${note}`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(request),
      });

      if (response.status === 200) {
        return await response.json();
      }

      throw new Error(`unable to update note with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to update note: ${error}`);
    }
  },
};
