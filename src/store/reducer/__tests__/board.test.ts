import {BoardState} from "types/store";
import {AddColumnRequest, EditColumnRequest} from "types/column";
import {boardReducer} from "../board";
import {ActionFactory} from "../../action";

describe("column tests", () => {
  let initialState: BoardState;
  beforeEach(() => {
    initialState = {
      data: {
        id: "test_board",
        name: "test_board",
        columns: [
          {
            id: "test_column_1",
            name: "test_column_1",
          },
        ],
      },
    };
  });

  test("add column", () => {
    const test_column: AddColumnRequest = {name: "test_column_2", hidden: false};
    const newState = boardReducer(initialState, ActionFactory.addColumn(test_column));

    expect(newState.data.columns.length).toEqual(2);
    expect(newState.data.columns[1]).toEqual(test_column);
  });

  test("remove column", () => {
    const newState = boardReducer(initialState, ActionFactory.deleteColumn("test_column_1"));
    expect(newState.data.columns.length).toEqual(0);
  });

  test("edit column (full)", () => {
    const editRequest: EditColumnRequest = {id: "test_column_1", name: "New name", color: "planning-pink", hidden: true};
    const newState = boardReducer(initialState, ActionFactory.editColumn({id: "test_column_1", name: "New name", color: "planning-pink", hidden: true}));
    expect(newState.data.columns[0]).toEqual(editRequest);
  });

  test("edit column (partial)", () => {
    const editRequest: EditColumnRequest = {id: "test_column_1", name: "New name"};
    const newState = boardReducer(initialState, ActionFactory.editColumn(editRequest));
    expect(newState.data.columns[0].name).toEqual("New name");
  });
});
