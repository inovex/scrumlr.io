import {EditNote, Note} from "../store/features/notes/types";
import {buildUrl} from "./index";

export const NoteAPI = {
  /**
   * Get all notes for a board
   *
   * @param boardId the board id
   *
   * @returns the requested notes
   */
  getNotes: async (boardId: string): Promise<Note[]> => {
    try {
      const url = buildUrl(`./boards/${boardId}/notes`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as Note[];
      }

      throw new Error(`get notes request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get notes`, {cause: error});
    }
  },

  /**
   * Get a note for a board
   *
   * @param boardId board id
   * @param noteId note id to request
   *
   * @returns the requested note
   */
  getNote: async (boardId: string, noteId: string): Promise<Note> => {
    try {
      const url = buildUrl(`./boards/${boardId}/notes/${noteId}`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as Note;
      }

      throw new Error(`get note request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get note`, {cause: error});
    }
  },

  /**
   * Adds a note to a board.
   *
   * @param boardId the board id
   * @param columnId the column id
   * @param text the note text
   *
   * @returns created note
   */
  addNote: async (boardId: string, columnId: string, text: string): Promise<Note> => {
    try {
      const url = buildUrl(`./boards/${boardId}/notes`);
      const response = await fetch(url, {
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
      throw new Error(`unable to create note`, {cause: error});
    }
  },

  /**
   * Deletes a note with the specified id.
   *
   * @param boardId board id
   * @param noteId the note id
   * @param deleteStack delete entire stack of note
   */
  deleteNote: async (boardId: string, noteId: string, deleteStack: boolean) => {
    try {
      const url = buildUrl(`./boards/${boardId}/notes/${noteId}`);
      const response = await fetch(url, {
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
      throw new Error(`unable to delete note`, {cause: error});
    }
  },

  /**
   * Edit a note with the specified id.
   *
   * @param boardId board id
   * @param noteId note id
   *
   * @returns updated note
   */
  editNote: async (boardId: string, noteId: string, request: EditNote): Promise<Note> => {
    try {
      const url = buildUrl(`./boards/${boardId}/notes/${noteId}`);
      const response = await fetch(url, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(request),
      });

      if (response.status === 200) {
        return (await response.json()) as Note;
      }

      throw new Error(`unable to update note with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to update note`, {cause: error});
    }
  },
};
