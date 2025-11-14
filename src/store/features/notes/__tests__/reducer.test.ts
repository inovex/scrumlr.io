import getTestStore from "utils/test/getTestStore";
import {deletedNote} from "store/features/notes/actions";
import {NotesState} from "store/features/notes/types";
import {EnhancedStore} from "@reduxjs/toolkit";
import {ApplicationState} from "store/store";

describe("noteReducer", () => {
  // test data: one single note; one note stack consisting of one parent and two children
  const testNotes: NotesState = [
    {id: "note-id-1", author: "author-id-1", edited: false, position: {column: "column-id-1", rank: 0, stack: null}, text: "single note"},
    {id: "note-id-2", author: "author-id-1", edited: false, position: {column: "column-id-1", rank: 0, stack: null}, text: "stack parent"},
    {id: "note-id-3", author: "author-id-1", edited: false, position: {column: "column-id-1", rank: 0, stack: "note-id-2"}, text: "stack child 1"},
    {id: "note-id-4", author: "author-id-1", edited: false, position: {column: "column-id-1", rank: 1, stack: "note-id-2"}, text: "stack child 2"},
  ];

  let mockStore: EnhancedStore<ApplicationState>;

  beforeEach(() => {
    mockStore = getTestStore({notes: testNotes});
  });

  it("should work", () => {
    expect(mockStore.getState().notes).toHaveLength(4);
    mockStore.dispatch(deletedNote("note-id-1"));
    expect(mockStore.getState().notes).toHaveLength(3);
  });
});
