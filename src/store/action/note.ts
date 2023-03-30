import {EditNote, Note} from "types/note";

/** This object lists note object specific internal Redux Action types. */
export const NoteAction = {
  /*
   * ATTENTION:
   * Don't forget the `as` casting for each field, because the type inference
   * won't work otherwise (e.g. in reducers).
   */
  AddNote: "scrumlr.io/addNote" as const,
  UpdatedNotes: "scrumlr.io/updatedNotes" as const,
  DeletedNote: "scrumlr.io/deletedNote" as const,

  ShareNote: "scrumlr.io/shareNote" as const,
  StopSharing: "scrumlr.io/stopSharing" as const,

  OnNoteFocus: "scrumlr.io/onNoteFocus" as const,
  OnNoteBlur: "scrumlr.io/onNoteBlur" as const,
  EditNote: "scrumlr.io/editNote" as const,
  UnstackNote: "scrumlr.io/unstackNote" as const,

  DeleteNote: "scrumlr.io/deleteNote" as const,
};

/** Factory or creator class of internal Redux note object specific actions. */
export const NoteActionFactory = {
  /*
   * ATTENTION:
   * Each action creator should be also listed in the type `NoteReduxAction`, because
   * the type inference won't work otherwise (e.g. in reducers).
   */
  /**
   * Creates an action which should be dispatched when the user wants to add a note for the specified
   * column id.
   *
   * @param columnId the column id
   * @param text the text of the note
   */
  addNote: (columnId: string, text: string) => ({
    type: NoteAction.AddNote,
    columnId,
    text,
  }),

  updatedNotes: (notes: Note[]) => ({
    type: NoteAction.UpdatedNotes,
    notes,
  }),
  deletedNote: (noteId: string) => ({
    type: NoteAction.DeletedNote,
    noteId,
  }),

  shareNote: (note: string) => ({
    type: NoteAction.ShareNote,
    note,
  }),

  stopSharing: () => ({
    type: NoteAction.StopSharing,
  }),

  onNoteFocus: () => ({
    type: NoteAction.OnNoteFocus,
  }),

  onNoteBlur: () => ({
    type: NoteAction.OnNoteBlur,
  }),

  /**
   * Creates an action which should be dispatched when the user edits a note.
   *
   * @param noteId the note id
   * @param text the edited text of the note
   */
  editNote: (note: string, request: EditNote) => ({
    type: NoteAction.EditNote,
    note,
    request,
  }),
  /**
   * Creates an action which should be dispatched when the user unstacks a note.
   * @param note contains the noteId and the parentId
   */
  unstackNote: (note: string) => ({
    type: NoteAction.UnstackNote,
    note,
  }),

  /**
   * Creates an action which should be dispatched when the user wants to delete a note.
   *
   * @param noteId the note id
   */
  deleteNote: (noteId: string) => ({
    type: NoteAction.DeleteNote,
    noteId,
  }),
};

export type NoteReduxAction =
  | ReturnType<typeof NoteActionFactory.addNote>
  | ReturnType<typeof NoteActionFactory.updatedNotes>
  | ReturnType<typeof NoteActionFactory.deletedNote>
  | ReturnType<typeof NoteActionFactory.shareNote>
  | ReturnType<typeof NoteActionFactory.stopSharing>
  | ReturnType<typeof NoteActionFactory.onNoteFocus>
  | ReturnType<typeof NoteActionFactory.onNoteBlur>
  | ReturnType<typeof NoteActionFactory.editNote>
  | ReturnType<typeof NoteActionFactory.unstackNote>
  | ReturnType<typeof NoteActionFactory.deleteNote>;
