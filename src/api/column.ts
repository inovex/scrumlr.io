import {Column, ColumnWithoutId} from "store/features/columns/types";
import {buildUrl} from "./index";

export const ColumnAPI = {
  /**
   * Get all columns from a board
   *
   * @param boardId
   *
   * @returns all columns from a board
   */
  getColumns: async (boardId: string): Promise<Column[]> => {
    try {
      const url = buildUrl(`./boards/${boardId}/columns`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as Column[];
      }

      throw new Error(`unable to get columns with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get columns`, {cause: error});
    }
  },

  /**
   * Get a column from a board
   *
   * @param boardId
   * @param columnId
   *
   * @returns column
   */
  getColumn: async (boardId: string, columnId: string): Promise<Column> => {
    try {
      const url = buildUrl(`./boards/${boardId}/columns/${columnId}`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as Column;
      }
      throw new Error(`unable to get column with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get column`, {cause: error});
    }
  },

  /**
   * Create a column on a board
   *
   * @param boardId board id
   * @param column column to create
   *
   * @returns created column
   */
  createColumn: async (boardId: string, column: {name: string; color: string; visible: boolean; index: number}): Promise<Column> => {
    try {
      const url = buildUrl(`./boards/${boardId}/columns`);
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(column),
      });

      if (response.status === 201) {
        return (await response.json()) as Column;
      }

      throw new Error(`unable to create column with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to create column`, {cause: error});
    }
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
  editColumn: async (boardId: string, columnId: string, column: ColumnWithoutId): Promise<Column> => {
    try {
      const url = buildUrl(`./boards/${boardId}/columns/${columnId}`);
      const response = await fetch(url, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(column),
      });

      if (response.status === 200) {
        return (await response.json()) as Column;
      }

      throw new Error(`unable to update column with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to update column`, {cause: error});
    }
  },

  /**
   * Delete a column
   *
   * @param boardId board id of the column
   * @param columnId column id
   */
  deleteColumn: async (boardId: string, columnId: string) => {
    try {
      const url = buildUrl(`./boards/${boardId}/columns/${columnId}`);
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      // HTTP Status No Content
      if (response.status === 204) {
        return;
      }

      throw new Error(`unable to update column with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to update column`, {cause: error});
    }
  },
};
