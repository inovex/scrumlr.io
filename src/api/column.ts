import {AddColumnRequest, EditColumnRequest} from "types/column";
import {SERVER_URL} from "../config";

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
   *  hidden: flag to set whether this column should be visible to all basic users (optional)
   *
   * @returns a {status, description} object
   */
  editColumn: async (boardId: string, columnId: string, column: EditColumnRequest) => {
    try {
      const response = await fetch(`${SERVER_URL}/boards/${boardId}/columns/${columnId}`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(column),
      });

      if (response.status === 200) {
        return await response.json();
      }

      throw new Error(`unable to update column with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to update column: ${error}`);
    }
  },
};
