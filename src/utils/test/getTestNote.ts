import {Note} from "../../store/features/notes/types";

export default (overwrite?: Partial<Note>): Note => ({
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
});
