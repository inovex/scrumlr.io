import {passNoteMiddleware} from "store/middleware/note";
import {ActionFactory} from "store/action";
import {API} from "api";
import {MiddlewareAPI} from "redux";

jest.mock("api", () => ({
  API: {
    addNote: jest.fn(),
    editNote: jest.fn(),
    deleteNote: jest.fn(),
    unstackNote: jest.fn(),
  },
}));

beforeEach(() => {
  (API.addNote as jest.Mock).mockClear();
  (API.editNote as jest.Mock).mockClear();
  (API.deleteNote as jest.Mock).mockClear();
  (API.unstackNote as jest.Mock).mockClear();
});

const stateAPI = {
  getState: () => ({
    board: {
      data: {
        id: "boardId",
      },
    },
  }),
};

describe("note middleware", () => {
  test("add note", () => {
    passNoteMiddleware(stateAPI as MiddlewareAPI, jest.fn(), ActionFactory.addNote("columnId", "Hello world"));
    expect(API.addNote).toHaveBeenCalledWith("boardId", "columnId", "Hello world");
  });

  test("edit note", () => {
    const note = {id: "noteId", text: "Changed text", columnId: "Changed column id"};
    passNoteMiddleware(stateAPI as MiddlewareAPI, jest.fn(), ActionFactory.editNote(note));
    expect(API.editNote).toHaveBeenCalledWith(note);
  });

  test("delete note", () => {
    passNoteMiddleware(stateAPI as MiddlewareAPI, jest.fn(), ActionFactory.deleteNote("noteId"));
    expect(API.deleteNote).toHaveBeenCalledWith("noteId");
  });

  test("unstack note", () => {
    passNoteMiddleware(stateAPI as MiddlewareAPI, jest.fn(), ActionFactory.unstackNote({id: "noteId", parentId: "parentId"}));
    expect(API.unstackNote).toHaveBeenCalledWith({id: "noteId", parentId: "parentId"}, "boardId");
  });
});
