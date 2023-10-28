import {Column, EditColumnRequest} from "types/column";
import {SERVER_HTTP_URL} from "../config";

export const ColumnAPI = {
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
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${boardId}/columns/${columnId}`, {
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
  getColumn: async (boardId: string, columnId: string) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${boardId}/columns/${columnId}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as {column: Column; columnsOrder: string[]};
      }

      throw new Error(`unable to get column with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get column: ${error}`);
    }
  },
  deleteColumn: async (boardId: string, columnId: string) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${boardId}/columns/${columnId}`, {
        method: "DELETE",
        credentials: "include",
      });

      // HTTP Status No Content
      if (response.status === 204) {
        return;
      }

      throw new Error(`unable to update column with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to update column: ${error}`);
    }
  },
  createColumn: async (boardId: string, column: {name: string; color: string; visible: boolean; index: number}) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${boardId}/columns`, {
        method: "POSt",
        credentials: "include",
        body: JSON.stringify(column),
      });

      if (response.status === 201) {
        return await response.json();
      }

      throw new Error(`unable to create column with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to create column: ${error}`);
    }
  },
};
