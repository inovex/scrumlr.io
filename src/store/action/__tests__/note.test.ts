import {AssertTypeEqual} from "testUtils";
import {NoteClientModel} from "types/note";
import {ReduxAction} from "../index";
import {NoteActionFactory, NoteActionType, NoteReduxAction} from "../note";

describe("note actions", () => {
  test("equal number of action types and factory functions", () => {
    expect(Object.keys(NoteActionType).length).toEqual(Object.keys(NoteActionFactory).length);
  });

  describe("add note", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof NoteActionFactory.addNote>, NoteReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof NoteActionFactory.addNote>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = NoteActionFactory.addNote("columnId", "Text");
      expect(action).toEqual({
        type: "@@SCRUMLR/addNote",
        columnId: "columnId",
        text: "Text",
      });
    });
  });

  describe("edit note", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof NoteActionFactory.editNote>, NoteReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof NoteActionFactory.editNote>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = NoteActionFactory.editNote("noteId", "New text");
      expect(action).toEqual({
        type: "@@SCRUMLR/editNote",
        noteId: "noteId",
        text: "New text",
      });
    });
  });

  describe("created note", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof NoteActionFactory.createdNote>, NoteReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof NoteActionFactory.createdNote>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = NoteActionFactory.createdNote(({test: true} as unknown) as NoteClientModeld);
      expect(action).toEqual({
        type: "@@SCRUMLR/createdNote",
        note: {test: true},
      });
    });
  });

  describe("updated note", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof NoteActionFactory.updatedNote>, NoteReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof NoteActionFactory.updatedNote>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = NoteActionFactory.updatedNote(({test: true} as unknown) as NoteClientModel);
      expect(action).toEqual({
        type: "@@SCRUMLR/updatedNote",
        note: {test: true},
      });
    });
  });

  describe("delete note", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof NoteActionFactory.deleteNote>, NoteReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof NoteActionFactory.deleteNote>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = NoteActionFactory.deleteNote("noteId");
      expect(action).toEqual({
        type: "@@SCRUMLR/deleteNote",
        noteId: "noteId",
      });
    });
  });

  describe("initialize notes", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof NoteActionFactory.initializeNotes>, NoteReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof NoteActionFactory.initializeNotes>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = NoteActionFactory.initializeNotes(([{test: true}] as unknown) as NoteClientModel[]);
      expect(action).toEqual({
        type: "@@SCRUMLR/initNotes",
        notes: [{test: true}],
      });
    });
  });
});
