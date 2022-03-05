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
    // TODO
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
