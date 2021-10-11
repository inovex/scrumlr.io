import Parse from "parse";

/**
 * The representation of a note on the server.
 */
export interface NoteServerModel extends Parse.Object {
  columnId: string;
  text: string;
  author: Parse.Object;
  parent?: Parse.Object;
  focus: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * The representation of a note on the client.
 */
export interface NoteClientModel {
  /** The id of the note or `undefined` if yet to be persisted. */
  id?: string;

  /** The column id of the column in which this note should be displayed. */
  columnId: string;

  /** The text of the note. */
  text: string;

  /** The user author of this note. */
  author: string;

  /** The parent of this note (if stacked). */
  parentId?: string;

  /** Focused during moderation phase. */
  focus: boolean;

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

type EditableNoteAttributes = {
  columnId: string;
  parentId: string;
  text: string;
  focus: boolean;
};

export type EditNoteRequest = {id: string} & Partial<EditableNoteAttributes>;

export const mapNoteServerToClientModel = (note: NoteServerModel): NoteClientModel => ({
  id: note.id,
  columnId: note.get("columnId"),
  text: note.get("text"),
  author: note.get("author").id,
  parentId: note.get("parent")?.id,
  focus: note.get("focus"),
  createdAt: note.get("createdAt"),
  updatedAt: note.get("updatedAt"),
  dirty: false,
});
