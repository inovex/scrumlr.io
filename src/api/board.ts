import {Color} from "constants/colors";
import {EditBoardRequest} from "types/board";
import {callAPI} from "api/callApi";
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
  editBoard: (board: EditBoardRequest) => callAPI("editBoard", {board}),

  /**
   * Create join request for a board session.
   * The return value might have the status `accepted` (user is permitted to join the board), `rejected` (the join
   * request of the user was rejected by an admin) or `pending`. If the state is pending the response will include
   * the reference on the join request state in the attribute `joinRequestReference`.
   *
   * @param boardId the board id
   * @param passphrase optional passphrase for the join request
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  joinBoard: async (boardId: string, passphrase?: string) => {
    const response = await fetch(`${SERVER_URL}/boards/${boardId}/participants`, {
      method: "POST",
      credentials: "include",
      redirect: "manual",
      body: JSON.stringify({passphrase}),
    });

    if (response.type === "opaqueredirect") {
      return {
        status: "accepted",
        joinRequestReference: "",
      };
    }

    // FIXME
    return {
      status: "rejected",
      joinRequestReference: "",
    };
  },

  acceptJoinRequests: (boardId: string, userIds: string[]) => callAPI<{board: string; users: string[]}, boolean>("acceptUsers", {board: boardId, participants: userIds}),
  rejectJoinRequests: (boardId: string, userIds: string[]) => callAPI<{board: string; users: string[]}, boolean>("rejectUsers", {board: boardId, participants: userIds}),

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
};
