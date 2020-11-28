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
    addNote: (boardId: string, text: string) => ({
        type: NoteActionType.AddNote,
        text
    }),
    editNote: (noteId: string, text: string) => ({
        type: NoteActionType.EditNote,
        noteId,
        text
    }),
    createdNote: (note: NoteClientModel) => ({
        type: NoteActionType.CreatedNote,
        note
    }),
    deleteNote: (noteId: string) => ({
        type: NoteActionType.DeleteNote,
        noteId
    }),
    updatedNote: (note: NoteClientModel) => ({
        type: NoteActionType.UpdatedNote,
        note
    }),
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



