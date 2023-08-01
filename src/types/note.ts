/**
 * The representation of a note on the server.
 */
export interface Note {
  id: string;
  author: string;
  text: string;
  position: {
    column: string;
    stack: string | null;
    rank: number;
  };
}

export type EditNote = Partial<Omit<Note, "id" | "author">>;

export type NotesState = Note[];
