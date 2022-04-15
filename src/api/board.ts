import {Color} from "constants/colors";
import {EditBoardRequest} from "types/board";
import {SERVER_HTTP_URL} from "../config";

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
      const response = await fetch(`${SERVER_HTTP_URL}/boards`, {
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
   * @param id the board id
   * @param board object with the board attributes that should be changed
   *
   * @returns the updated board model
   */
  editBoard: async (id: string, board: EditBoardRequest) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${id}`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(board),
      });

      if (response.status === 200) {
        return await response.json();
      }

      throw new Error(`unable to update board with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to update board: ${error}`);
    }
  },

  /**
   * Deletes the board with the specified id.
   *
   * @param board identifies the board which will be deleted
   */
  deleteBoard: async (board: string) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${board}`, {
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

  /**
   * Exports the board by the specified id and MIME type.
   *
   * @param board the board id
   * @param type the MIME type
   *
   * @returns the response of the fetch call
   */
  exportBoard: async (board: string, type: "text/csv" | "application/json") => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${board}/export`, {
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
  setTimer: async (id: string, minutes: number) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${id}/timer`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({minutes}),
      });

      if (response.status === 200) {
        return await response.json();
      }

      throw new Error(`unable to update board timer with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to update board timer: ${error}`);
    }
  },
  deleteTimer: async (id: string) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${id}/timer`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 200) {
        return await response.json();
      }

      throw new Error(`unable to delete board timer with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to delete board timer: ${error}`);
    }
  },
};
