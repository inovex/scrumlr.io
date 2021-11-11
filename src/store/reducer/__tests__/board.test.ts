import {BoardState} from "types/store";
import {EditBoardRequest} from "types/board";
import {boardReducer} from "store/reducer/board";
import {AddColumnRequest, EditColumnRequest} from "types/column";
import {ActionFactory} from "store/action";

describe("moderation configuration reducer", () => {
  let initialState: BoardState;

  beforeEach(() => {
    initialState = {
      status: "unknown",
    };
  });

  test("edit board", () => {
    const data: EditBoardRequest = {
      id: "test_board",
      moderation: {userId: "test_user", status: "active"},
    };
    const newState = boardReducer(initialState, ActionFactory.editBoard(data));
    expect(newState.data?.moderation).toEqual(data.moderation);
  });
});

describe("column tests", () => {
  let initialState: BoardState;
  beforeEach(() => {
    initialState = {
      data: {
        id: "test_board",
        name: "test_board",
        columns: [
          {
            columnId: "test_column_1",
            name: "test_column_1",
            color: "backlog-blue",
            hidden: false,
          },
        ],
      },
    };
  });

  test("add column", () => {
    const testColumn: AddColumnRequest = {name: "test_column_2", hidden: false, color: "backlog-blue"};
    const newState = boardReducer(initialState, ActionFactory.addColumn(testColumn));

    expect(newState.data).toBeDefined();
    expect(newState.data!.columns.length).toEqual(2);
    expect(newState.data!.columns[1]).toEqual(testColumn);
  });

  test("remove column", () => {
    const newState = boardReducer(initialState, ActionFactory.deleteColumn("test_column_1"));
    expect(newState.data).toBeDefined();
    expect(newState.data!.columns.length).toEqual(0);
  });

  test("edit column (full)", () => {
    const editRequest: EditColumnRequest = {columnId: "test_column_1", name: "New name", color: "planning-pink", hidden: true};
    const newState = boardReducer(initialState, ActionFactory.editColumn({columnId: "test_column_1", name: "New name", color: "planning-pink", hidden: true}));
    expect(newState.data).toBeDefined();
    expect(newState.data!.columns[0]).toEqual(editRequest);
  });

  test("edit column (partial)", () => {
    const editRequest: EditColumnRequest = {columnId: "test_column_1", name: "New name"};
    const newState = boardReducer(initialState, ActionFactory.editColumn(editRequest));
    expect(newState.data).toBeDefined();
    expect(newState.data!.columns[0].name).toEqual("New name");
  });
});
