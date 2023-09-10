import {Note} from "../../types/note";

export default (overwrite?: Partial<Note>): Note => ({
  id: "test-note-id",
  sequence_num: 0,
  nxt_sequence_num: 1,
  author: "test-note-author",
  text: "Lorem ipsum dolor sit amet",
  position: {
    stack: null,
    column: "test-note-position-column-id",
    rank: 0,
  },
  ...overwrite,
});
