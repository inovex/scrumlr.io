import {Color} from "constants/colors";
import {callAPI} from "./callApi";

export const ColumnAPI = {
  /**
   * Adds a column with the specified name and configuration to a board.
   *
   * @param boardId the board id
   * @param name the column name
   * @param color the column color
   * @param hidden flag whether the column should be displayed to all users or hidden from basic users
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  addColumn: (boardId: string, name: string, color: Color, hidden = false) =>
    callAPI<{boardId: string; name: string; hidden: boolean}, boolean>("addColumn", {boardId, name, hidden}),
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
   * @param columnId the column id
   * @param name new name to set (optional)
   * @param color new column color to set (optional)
   * @param hidden flag to set whether this columns should be visible to all basic users (optional)
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  editColumn: (boardId: string, columnId: string, name?: string, color?: Color, hidden?: boolean) =>
    callAPI<{boardId: string; columnId: string; name?: string; hidden?: boolean}, boolean>("editColumn", {boardId, columnId, name, hidden}),
};
