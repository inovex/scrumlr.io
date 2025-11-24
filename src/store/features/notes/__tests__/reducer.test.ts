import getTestStore from "utils/test/getTestStore";
import {deletedNote} from "store/features/notes/actions";
import {NotesState} from "store/features/notes/types";
import {EnhancedStore} from "@reduxjs/toolkit";
import {ApplicationState} from "store/store";
import {deletedColumn} from "store/features/columns";

describe("noteReducer", () => {
  // test data: one single note; one note stack consisting of one parent and two children
  const testNotes: NotesState = [
    {id: "note-id-single-1", author: "author-id-1", edited: false, position: {column: "test-columns-id-1", rank: 0, stack: null}, text: "single note 1"},
    {id: "note-id-single-2", author: "author-id-1", edited: false, position: {column: "test-columns-id-2", rank: 0, stack: null}, text: "single note 2"},
    {id: "note-id-parent", author: "author-id-1", edited: false, position: {column: "test-columns-id-1", rank: 0, stack: null}, text: "stack parent"},
    {id: "note-id-child-1", author: "author-id-1", edited: false, position: {column: "test-columns-id-1", rank: 0, stack: "note-id-parent"}, text: "stack child 1"},
    {id: "note-id-child-2", author: "author-id-1", edited: false, position: {column: "test-columns-id-1", rank: 1, stack: "note-id-parent"}, text: "stack child 2"},
  ];

  let mockStore: EnhancedStore<ApplicationState>;

  beforeEach(() => {
    mockStore = getTestStore({notes: testNotes});
  });

  describe("deletedNote", () => {
    test("delete nothing", () => {
      mockStore.dispatch(deletedNote("nothing"));
      expect(mockStore.getState().notes).toEqual(testNotes);
    });

    test("delete single note", () => {
      mockStore.dispatch(deletedNote("note-id-single"));
      expect(mockStore.getState().notes).toEqual(expect.not.arrayContaining([expect.objectContaining({id: "note-id-1"})]));
    });

    // stack should remain, but rank should be adjusted
    test("delete child note", () => {
      mockStore.dispatch(deletedNote("note-id-child-1"));
      expect(mockStore.getState().notes).toEqual(expect.not.arrayContaining([expect.objectContaining({id: "note-id-child-1"})]));
      expect(mockStore.getState().notes).toEqual(expect.arrayContaining([expect.objectContaining({id: "note-id-child-2", position: expect.objectContaining({rank: 0})})]));
    });

    // first child note becomes the new parent; stack should be updated accordingly
    test("delete parent note", () => {
      mockStore.dispatch(deletedNote("note-id-parent"));
      expect(mockStore.getState().notes).toEqual(expect.not.arrayContaining([expect.objectContaining({id: "note-id-parent"})]));
      expect(mockStore.getState().notes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({id: "note-id-child-1", position: expect.objectContaining({stack: "note-id-child-2"})}),
          expect.objectContaining({id: "note-id-child-2", position: expect.objectContaining({stack: null})}),
        ])
      );
    });
  });

  describe("deletedColumn", () => {
    test("delete column", () => {
      mockStore.dispatch(deletedColumn("test-columns-id-2"));
      expect(mockStore.getState().notes).toEqual(expect.not.arrayContaining([expect.objectContaining({position: expect.objectContaining({column: "test-columns-id-2"})})]));
    });
  });
});
