import Parse from 'parse';

/**
 * The representation of a note on the server.
 */
export interface NoteServerModel extends Parse.Object {
    text: string;
    author: Parse.Object;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * The representation of a note on the client.
 */
export interface NoteClientModel {

    /** The id of the note or `undefined` if yet to be persisted. */
    id?: string;

    /** The text of the note. */
    text: string;

    /** The user author of this note. */
    author: string;

    /** The creation date of this object. */
    createdAt?: Date;

    /** The last update date of this object. */
    updatedAt?: Date;

    /**
     * This flag indicated whether local changes have yet to be persisted.
     * It is set to `true` if some fields aren't persisted yet and `false` otherwise.
     */
    dirty: boolean;

    // TODO add editable & stackable attributes (if id ist not undefined and note is persisted)
}

export const mapNoteServerToClientModel = (note: NoteServerModel): NoteClientModel => ({
    id: note.id,
    text: note.get('text'),
    author: note.get('author').id,
    createdAt: note.get('createdAt'),
    updatedAt: note.get('updatedAt'),
    dirty: false
});