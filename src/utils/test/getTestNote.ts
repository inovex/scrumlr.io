import {Note} from "../../types/note";

export default (overwrite?: Partial<Note>): Note => ({
  id: "test-note-id",
  author: "test-note-author",
  text: "Lorem ipsum dolor sit amet",
  position: {
    column: "test-note-position-column-id",
    rank: 0,
    stack: null,
  },
  ...overwrite,
});
