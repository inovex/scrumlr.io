import {Note} from "../../store/features/notes/types";

export default function getTestNote(overwrite?: Partial<Note>): Note {
  return {
    id: "test-note-id",
    author: "test-note-author",
    text: "Lorem ipsum dolor sit amet",
    position: {
      stack: null,
      column: "test-note-position-column-id",
      rank: 0,
    },
    edited: true,
    ...overwrite,
  };
}
