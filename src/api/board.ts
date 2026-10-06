import {Color} from "constants/colors";
import {Board, BoardImportData, CreateSessionAccessPolicy, EditBoardRequest, ImportBoardResponse} from "store/features/board/types";
import {BoardOverview} from "store/features/history/types";
import {buildUrl} from "./index";

export const BoardAPI = {
  /**
   * Returns an overview of all boards the current user has a session on (the History list).
   *
   * @returns the list of board overviews
   */
  getBoards: async (): Promise<BoardOverview[]> => {
    try {
      const url = buildUrl(`./boards`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as BoardOverview[];
      }

      throw new Error(`request resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get boards`, {cause: error});
    }
  },

  /**
   * Get a board with the given id
   *
   * @param id the id of the board
   *
   * @returns the board
   */
  getBoard: async (id: string): Promise<Board> => {
    try {
      const url = buildUrl(`./boards/${id}`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as Board;
      }

      throw new Error(`request resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get board`, {cause: error});
    }
  },

  /**
   * Creates a board with the specified parameters and returns the board id.
   *
   * @param name the board name
   * @param description the board description
   * @param accessPolicy the access policy configuration of the board
   * @param columns the definition of the columns
   *
   * @returns the board id of the created board
   */
  createBoard: async (
    name: string | undefined,
    description: string | undefined,
    accessPolicy: CreateSessionAccessPolicy,
    columns: {name: string; visible: boolean; color: Color}[]
  ): Promise<string> => {
    try {
      const url = buildUrl(`./boards`);
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          name,
          description,
          accessPolicy: accessPolicy.policy,
          passphrase: accessPolicy.policy === "BY_PASSPHRASE" ? accessPolicy.passphrase : undefined,
          columns,
        }),
      });

      if (response.status === 201) {
        const body = (await response.json()) as Board;
        return body.id;
      }

      throw new Error(`request resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to create board`, {cause: error});
    }
  },

  /**
   * Import a josn board
   *
   * @param boardJson board to import
   *
   * @returns imported board
   */
  importBoard: async (boardJson: BoardImportData): Promise<ImportBoardResponse> => {
    try {
      const url = buildUrl(`./import`);
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(boardJson),
      });

      if (response.status === 201) {
        return (await response.json()) as ImportBoardResponse;
      }

      throw new Error(`request resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to import board`, {cause: error});
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
  editBoard: async (id: string, board: EditBoardRequest): Promise<Board> => {
    try {
      const url = buildUrl(`./boards/${id}`);
      const response = await fetch(url, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(board),
      });

      if (response.status === 200) {
        return (await response.json()) as Board;
      }

      throw new Error(`unable to update board with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to update board`, {cause: error});
    }
  },

  /**
   * Deletes the board with the specified id.
   *
   * @param id identifies the board which will be deleted
   */
  deleteBoard: async (id: string) => {
    try {
      const url = buildUrl(`./boards/${id}`);
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 204) {
        return;
      }

      throw new Error(`delete board request resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to create board`, {cause: error});
    }
  },

  /**
   * Exports the board by the specified id and MIME type.
   *
   * @param id the board id
   * @param type the MIME type
   *
   * @returns the response of the fetch call
   */
  exportBoard: async (id: string, type: "text/csv" | "application/json"): Promise<Response> => {
    try {
      const url = buildUrl(`./boards/${id}/export`);
      const response = await fetch(url, {
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
      throw new Error(`unable to create board`, {cause: error});
    }
  },

  /**
   * Set a new timer for a board
   *
   * @param id id of the board
   * @param minutes minutes for the timer to set
   *
   * @returns board with set timer
   */
  setTimer: async (id: string, minutes: number): Promise<Board> => {
    try {
      const url = buildUrl(`./boards/${id}/timer`);
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({minutes}),
      });

      if (response.status === 200) {
        return (await response.json()) as Board;
      }

      throw new Error(`unable to update board timer with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to update board timer`, {cause: error});
    }
  },

  /**
   * Delte the timer of a board
   *
   * @param id id of the board
   *
   * @returns board with the deleted timer
   */
  deleteTimer: async (id: string): Promise<Board> => {
    try {
      const url = buildUrl(`./boards/${id}/timer`);
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as Board;
      }

      throw new Error(`unable to delete board timer with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to delete board timer`, {cause: error});
    }
  },

  /**
   * Increment the timer of a board by one minute
   *
   * @param id id of the board
   *
   * @returns board with the incremented timer
   */
  incrementTimer: async (id: string): Promise<Board> => {
    try {
      const url = buildUrl(`./boards/${id}/timer/increment`);
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as Board;
      }

      throw new Error(`unable to increment board timer with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to increment board timer`, {cause: error});
    }
  },
};
