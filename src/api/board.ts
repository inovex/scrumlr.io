import {Color} from "constants/colors";
import {EditBoardRequest} from "types/board";
import {callAPI} from "api/callApi";

export const BoardAPI = {
  /**
   * Creates a board with the specified parameters and returns the board id.
   *
   * @param columns the definition of the columns
   * @param accessPolicy the access policy configuration of the board
   * @param name the board name
   *
   * @returns the board id of the created board
   */
  createBoard: (name: string | undefined, accessPolicy: {type: string; passphrase?: string}, columns: {name: string; hidden: boolean; color: Color}[]) =>
    callAPI<{columns: {name: string; hidden: boolean}[]; name?: string; accessPolicy: {type: string; passphrase?: string}}, string>("createBoard", {columns, name, accessPolicy}),

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
   * @param passphrase optional passphrose for the join request
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  joinBoard: (boardId: string, passphrase?: string) =>
    callAPI<{boardId: string; passphrase?: string}, {status: "accepted" | "rejected" | "pending" | "passphrase_required" | "incorrect_passphrase"; joinRequestReference?: string}>(
      "joinBoard",
      {boardId, passphrase}
    ),

  acceptJoinRequests: (boardId: string, userIds: string[]) => callAPI<{board: string; users: string[]}, boolean>("acceptUsers", {board: boardId, users: userIds}),
  rejectJoinRequests: (boardId: string, userIds: string[]) => callAPI<{board: string; users: string[]}, boolean>("rejectUsers", {board: boardId, users: userIds}),
  /**
   * Deletes the board with the specified boardId.
   *
   * @param boardId identifies the board which will be deleted
   * @returns 'true' if the operation succeeded or throws an error otherwise
   */
  deleteBoard: (boardId: string) => callAPI("deleteBoard", {boardId}),
  /**
   * Cancel the current voting phase.
   *
   * @param boardId the board id
   * @returns a {status, description} object
   */
  cancelVoting: (boardId: string) => callAPI("cancelVoting", {boardId}),

  /** Sets the date where the timer of the board ends.
   *
   * @param endDate the date/time where the timer ends
   * @param boardId the board identifier
   * @returns a {status, description} object
   */
  setTimer: (endDate: Date, boardId: string) => callAPI("setTimer", {endDate, boardId}),

  /**
   * Cancels the timer of the board.
   *
   * @param boardId the board identifier
   * @returns a {status, description} object
   */
  cancelTimer: (boardId: string) => callAPI("cancelTimer", {boardId}),
};
