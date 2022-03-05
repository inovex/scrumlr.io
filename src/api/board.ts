import {Color} from "constants/colors";
import {EditBoardRequest} from "types/board";
import {SERVER_URL} from "../config";

export const BoardAPI = {
  /**
   * Creates a board with the specified parameters and returns the board id.
   *
   * @param name the board name
   * @param accessPolicy the access policy configuration of the board
   * @param columns the definition of the columns
   *
   * @returns the board id of the created board
   */
  createBoard: async (name: string | undefined, accessPolicy: {type: string; passphrase?: string}, columns: {name: string; hidden: boolean; color: Color}[]) => {
    try {
      const response = await fetch(`${SERVER_URL}/boards`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          name,
          accessPolicy: accessPolicy.type,
          passphrase: accessPolicy.passphrase,
          columns: columns.map((c) => ({name: c.name, visible: !c.hidden, color: c.color})),
        }),
      });

      if (response.status === 201) {
        const body = await response.json();
        return body.id;
      }

      throw new Error(`request resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to create board: ${error}`);
    }
  },

  /**
   * Edits the board with the specified parameters.
   *
   * @param board object with the board attributes that have to be changed
   * @returns 'true' if the operation succeeded or throws an error otherwise
   */
  editBoard: async (id: string, board: EditBoardRequest) => {
    try {
      const response = await fetch(`${SERVER_URL}/boards/${id}`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(board),
      });

      if (response.status === 200) {
        return await response.json();
      }

      throw new Error(`unable to update board with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to create board: ${error}`);
    }
  },

  /**
   * Deletes the board with the specified boardId.
   *
   * @param boardId identifies the board which will be deleted
   * @returns 'true' if the operation succeeded or throws an error otherwise
   */
  deleteBoard: async (boardId: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/boards/${boardId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status !== 204) {
        throw new Error(`delete board request resulted in response status ${response.status}`);
      }
    } catch (error) {
      throw new Error(`unable to create board: ${error}`);
    }
  },

  exportBoard: async (board: string, type: "text/csv" | "application/json") => {
    try {
      const response = await fetch(`${SERVER_URL}/boards/${board}/export`, {
        method: "GET",
        headers: {
          Accept: type,
        },
        credentials: "include",
      });

      if (response.status === 200) {
        return response;
      }

      throw new Error(`unable to update board with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to create board: ${error}`);
    }
  },
};
