import {NoteClientModel} from "../../types/note";

/** This object lists note object specific internal Redux Action types. */
export const NoteActionType = {
    /*
     * ATTENTION:
     * Don't forget the `as` casting for each field, because the type inference
     * won't work otherwise (e.g. in reducers).
     */
    AddNote: '@@SCRUMLR/addNote' as '@@SCRUMLR/addNote',
    EditNote: '@@SCRUMLR/editNote' as '@@SCRUMLR/editNote',
    CreatedNote: '@@SCRUMLR/createdNote' as '@@SCRUMLR/createdNote',
    DeleteNote: '@@SCRUMLR/deleteNote' as '@@SCRUMLR/deleteNote',
    UpdatedNote: '@@SCRUMLR/updatedNote' as '@@SCRUMLR/updatedNote',
    InitializeNotes: '@@SCRUMLR/initNotes' as '@@SCRUMLR/initNotes'
}

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
        type: NoteActionType.AddNote,
        columnId,
        text
    }),
    /**
     * Creates an action which should be dispatched when the user edits a note.
     *
     * @param noteId the note id
     * @param text the new text to set
     */
    editNote: (noteId: string, text: string) => ({
        type: NoteActionType.EditNote,
        noteId,
        text
    }),
    /**
     * Creates an action which should be dispatched when a new note was created on the server.
     *
     * @param note the note
     */
    createdNote: (note: NoteClientModel) => ({
        type: NoteActionType.CreatedNote,
        note
    }),
    /**
     * Creates an action which should be dispatched when the user wants to delete a note.
     *
     * @param noteId the note id
     */
    deleteNote: (noteId: string) => ({
        type: NoteActionType.DeleteNote,
        noteId
    }),
    /**
     * Creates an action which should be dispatched when a note was updated on the server.
     *
     * @param note the note
     */
    updatedNote: (note: NoteClientModel) => ({
        type: NoteActionType.UpdatedNote,
        note
    }),
    /**
     * Creates an action which should be dispatched when the server returns the list of notes on the initial
     * get request.
     *
     * @param notes the list of notes persisted on the server for the current board
     */
    initializeNotes: (notes: NoteClientModel[]) => ({
        type: NoteActionType.InitializeNotes,
        notes
    })
}

export type NoteReduxAction =
    | ReturnType<typeof NoteActionFactory.addNote>
    | ReturnType<typeof NoteActionFactory.editNote>
    | ReturnType<typeof NoteActionFactory.createdNote>
    | ReturnType<typeof NoteActionFactory.deleteNote>
    | ReturnType<typeof NoteActionFactory.initializeNotes>
    | ReturnType<typeof NoteActionFactory.updatedNote>