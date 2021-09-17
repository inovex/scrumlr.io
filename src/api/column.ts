import {AddColumnRequest, EditColumnRequest} from "types/column";
import {callAPI} from "./callApi";

export const ColumnAPI = {
  /**
   * Adds a column with the specified name and configuration to a board.
   *
   * @param boardId the board id
   * @param addColumnRequest contains
   *  name: the column name
   *  color: the column color
   *  hidden: flag whether the column should be displayed to all users or hidden from basic users
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  addColumn: (boardId: string, addColumnRequest: AddColumnRequest) =>
    callAPI<{boardId: string; addColumnRequest: AddColumnRequest}, boolean>("addColumn", {boardId, addColumnRequest}),
  /**
   * Deletes a column with the specified id.
   *
   * @param boardId the board id
   * @param columnId the column id
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  deleteColumn: (boardId: string, columnId: string) => callAPI<{boardId: string; columnId: string}, boolean>("deleteColumn", {boardId, columnId}),
  /**
   * Edit a column with the specified id.
   *
   * @param boardId the board id
   * @param editColumnRequest contains
   *  columnId: the column id
   *  name: new name to set (optional)
   *  color: new column color to set (optional)
   *  hidden: flag to set whether this columns should be visible to all basic users (optional)
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  editColumn: (boardId: string, editColumnRequest: EditColumnRequest) =>
    callAPI<{boardId: string; editColumnRequest: EditColumnRequest}, boolean>("editColumn", {boardId, editColumnRequest}),
};
