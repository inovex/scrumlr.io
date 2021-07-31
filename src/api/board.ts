import {Color} from "constants/colors";
import {callAPI} from "./callApi";

export const BoardAPI = {
  /**
   * Creates a board with the specified parameters and returns the board id.
   *
   * @param columns the definition of the columns
   * @param name the board name
   *
   * @returns the board id of the created board
   */
  createBoard: (name: string, joinConfirmationRequired: boolean, columns: {name: string; hidden: boolean; color: Color}[]) =>
    callAPI<{columns: {name: string; hidden: boolean}[]; name: string; joinConfirmationRequired: boolean}, string>("createBoard", {columns, name, joinConfirmationRequired}),

  /**
   * Create join request for a board session.
   * The return value might have the status `accepted` (user is permitted to join the board), `rejected` (the join
   * request of the user was rejected by an admin) or `pending`. If the state is pending the response will include
   * the reference on the join request state in the attribute `joinRequestReference`.
   *
   * @param boardId the board id
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  joinBoard: (boardId: string) => callAPI<{boardId: string}, {status: "accepted" | "rejected" | "pending"; joinRequestReference?: string}>("joinBoard", {boardId}),
  acceptJoinRequests: (boardId: string, userIds: string[]) => callAPI<{board: string; users: string[]}, boolean>("acceptUsers", {board: boardId, users: userIds}),
  rejectJoinRequests: (boardId: string, userIds: string[]) => callAPI<{board: string; users: string[]}, boolean>("rejectUsers", {board: boardId, users: userIds}),
};
