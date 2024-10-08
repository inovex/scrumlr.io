export interface Note {
  id: string;
  author: string;
  text: string;
  position: {
    column: string;
    stack: string | null;
    rank: number;
  };
  edited: boolean;
}

export type EditNote = Partial<Omit<Note, "id" | "author">>;

export type NotesState = Note[];
