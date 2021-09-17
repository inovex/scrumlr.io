import {passColumnMiddleware} from "store/middleware/column";
import {ActionFactory} from "store/action";
import {API} from "api";
import {MiddlewareAPI} from "redux";

jest.mock("api", () => ({
  API: {
    addColumn: jest.fn(),
    editColumn: jest.fn(),
    deleteColumn: jest.fn(),
  },
}));

beforeEach(() => {
  (API.addColumn as jest.Mock).mockClear();
  (API.editColumn as jest.Mock).mockClear();
  (API.deleteColumn as jest.Mock).mockClear();
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

describe("column middleware", () => {
  test("add column", () => {
    passColumnMiddleware(stateAPI as MiddlewareAPI, jest.fn(), ActionFactory.addColumn({name: "Column", color: "planning-pink", hidden: false}));
    expect(API.addColumn).toHaveBeenCalledWith("boardId", {name: "Column", color: "planning-pink", hidden: false});
  });

  test("edit column", () => {
    passColumnMiddleware(stateAPI as MiddlewareAPI, jest.fn(), ActionFactory.editColumn({id: "columnId", name: "New name", color: "planning-pink", hidden: true}));
    expect(API.editColumn).toHaveBeenCalledWith("boardId", {id: "columnId", name: "New name", color: "planning-pink", hidden: true});
  });

  test("delete column", () => {
    passColumnMiddleware(stateAPI as MiddlewareAPI, jest.fn(), ActionFactory.deleteColumn("columnId"));
    expect(API.deleteColumn).toHaveBeenCalledWith("boardId", "columnId");
  });
});
