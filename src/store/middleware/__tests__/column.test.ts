import {passColumnMiddleware} from "store/middleware/column";
import {ActionFactory} from "store/action";
import {API} from "api";

jest.mock("api", () => {
  return {
    API: {
      addColumn: jest.fn(),
      editColumn: jest.fn(),
      deleteColumn: jest.fn(),
    },
  };
});

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
    passColumnMiddleware(stateAPI as any, jest.fn(), ActionFactory.addColumn("Column", "planning-pink"));
    expect(API.addColumn).toHaveBeenCalledWith("boardId", "Column", "planning-pink", false);
  });

  test("edit column", () => {
    passColumnMiddleware(stateAPI as any, jest.fn(), ActionFactory.editColumn("columnId", "New name", "planning-pink", true));
    expect(API.editColumn).toHaveBeenCalledWith("boardId", "columnId", "New name", "planning-pink", true);
  });

  test("delete column", () => {
    passColumnMiddleware(stateAPI as any, jest.fn(), ActionFactory.deleteColumn("columnId"));
    expect(API.deleteColumn).toHaveBeenCalledWith("boardId", "columnId");
  });
});
