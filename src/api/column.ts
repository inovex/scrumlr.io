import {StatusResponse} from "types";
import {AddColumnRequest, EditColumnRequest} from "types/column";
import {callAPI} from "api/callApi";

export const ColumnAPI = {
  /**
   * Adds a column with the specified name and configuration to a board.
   *
   * @param boardId the board id
   * @param column contains
   *  name: the column name
   *  color: the column color
   *  hidden: flag whether the column should be displayed to all users or hidden from basic users
   *
   * @returns status and (error-)description of request
   */
  addColumn: (boardId: string, column: AddColumnRequest) => callAPI<{boardId: string; column: AddColumnRequest}, StatusResponse>("addColumn", {boardId, column}),
  /**
   * Deletes a column with the specified id.
   *
   * @param boardId the board id
   * @param columnId the column id
   *
   * @returns status and (error-)description of request
   */
  deleteColumn: (boardId: string, columnId: string) => callAPI<{boardId: string; columnId: string}, StatusResponse>("deleteColumn", {boardId, columnId}),
  /**
   * Edit a column with the specified id.
   *
   * @param boardId the board id
   * @param column contains
   *  columnId: the column id
   *  name: new name to set (optional)
   *  color: new column color to set (optional)
   *  hidden: flag to set whether this columns should be visible to all basic users (optional)
   *
   * @returns status and (error-)description of request
   */
  editColumn: (boardId: string, column: EditColumnRequest) => callAPI<{boardId: string; column: EditColumnRequest}, StatusResponse>("editColumn", {boardId, column}),
};
