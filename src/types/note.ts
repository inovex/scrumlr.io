/**
 * The representation of a note on the server.
 */
export interface Note {
  id: string;
  author: string;
  text: string;
  position: {
    column: string;
    stack?: string;
    rank: number;
  };
}

export type NotesState = Note[];
