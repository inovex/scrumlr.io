import {AddColumnRequest, EditColumnRequest} from "types/column";

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
  addColumn: (boardId: string, column: AddColumnRequest) => {
    // TODO
  },

  /**
   * Deletes a column with the specified id.
   *
   * @param boardId the board id
   * @param columnId the column id
   *
   * @returns a {status, description} object
   */
  deleteColumn: (boardId: string, columnId: string) => {
    // TODO
  },

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
   * @returns a {status, description} object
   */
  editColumn: (boardId: string, column: EditColumnRequest) => {
    // TODO
  },
};
