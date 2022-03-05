import {Board, EditBoardRequest} from "types/board";
import {Column} from "../../types/column";
import {Participant} from "../../types/participant";

/** This object lists board object specific internal Redux Action types. */
export const BoardAction = {
  /*
   * ATTENTION:
   * Don't forget the `as` casting for each field, because the type inference
   * won't work otherwise (e.g. in reducers).
   */
  LeaveBoard: "scrumlr.io/leaveBoard" as const,
  JoinBoard: "scrumlr.io/joinBoard" as const,
  InitializeBoard: "scrumlr.io/initBoard" as const,
  EditBoard: "scrumlr.io/editBoard" as const,
  UpdatedBoard: "scrumlr.io/updatedBoard" as const,
  DeleteBoard: "scrumlr.io/deleteBoard" as const,
  PermittedBoardAccess: "scrumlr.io/permittedBoardAccess" as const,
  RejectedBoardAccess: "scrumlr.io/rejectedBoardAccess" as const,
  PendingBoardAccessConfirmation: "scrumlr.io/pendingBoardAccessConfirmation" as const,
  PassphraseChallengeRequired: "scrumlr.io/passphraseChallengeRequired" as const,
  IncorrectPassphrase: "scrumlr.io/incorrectPassphrase" as const,
  CancelVoting: "scrumlr.io/cancelVoting" as const,
  SetTimer: "scrumlr.io/setTimer" as const,
  CancelTimer: "scrumlr.io/cancelTimer" as const,
};

/** Factory or creator class of internal Redux board object specific actions. */
export const BoardActionFactory = {
  /*
   * ATTENTION:
   * Each action creator should be also listed in the type `BoardReduxAction`, because
   * the type inference won't work otherwise (e.g. in reducers).
   */
  /** Creates an action which should be dispatched when the user leaves the current board. */
  leaveBoard: () => ({
    type: BoardAction.LeaveBoard,
  }),
  /**
   * Creates an action which should be dispatched when the user tries to join a board.
   *
   * @param boardId the board id
   * @param passphrase optional passphrase is board is protected by it
   */
  joinBoard: (boardId: string, passphrase?: string) => ({
    type: BoardAction.JoinBoard,
    boardId,
    passphrase,
  }),
  /**
   * Creates an action which should be dispatched when the initial query on the board data from the server returns
   * its result.
   *
   * @param board the board data
   * @param columns the columns of the board
   */
  initializeBoard: (board: Board, columns: Column[], participants: Participant[]) => ({
    type: BoardAction.InitializeBoard,
    board,
    columns,
    participants,

    /* TODO
    notes,
    votings,
    votes,
    participants,
    requests
    */
  }),
  /**
   * Creates an action which should be dispatched when the user wants to edit the board.
   *
   * @param board the partial board model with the fields to update
   */
  editBoard: (board: EditBoardRequest) => ({
    type: BoardAction.EditBoard,
    board,
  }),
  /**
   * Creates an action which should be dispatched when the board data was updated on the server.
   *
   * @param board the updated board
   */
  updatedBoard: (board: Board) => ({
    type: BoardAction.UpdatedBoard,
    board,
  }),
  /** Creates an action which should be dispatched when the user wants to delete the current board. */
  deleteBoard: (boardId: string) => ({
    type: BoardAction.DeleteBoard,
    boardId,
  }),
  /**
   * Creates an action which should be dispatched when the user was permitted to access the board with
   * the specified id.
   *
   * @param boardId the board id
   */
  permittedBoardAccess: (boardId: string) => ({
    type: BoardAction.PermittedBoardAccess,
    boardId,
  }),
  /** Creates an action which should be dispatched was rejected from a board. */
  rejectedBoardAccess: () => ({
    type: BoardAction.RejectedBoardAccess,
  }),
  /**
   * Creates an action which should be dispatched when the user access request to a board is pending.
   *
   * @param requestReference the reference id on the join request
   */
  pendingBoardAccessConfirmation: (requestReference: string) => ({
    type: BoardAction.PendingBoardAccessConfirmation,
    requestReference,
  }),
  requirePassphraseChallenge: () => ({
    type: BoardAction.PassphraseChallengeRequired,
  }),
  incorrectPassphrase: () => ({
    type: BoardAction.IncorrectPassphrase,
  }),
  /**
   * Creates an action which should be dispatched when the current voting phase was canceled.
   *
   * @param boardId
   */
  cancelVoting: (boardId: string) => ({
    type: BoardAction.CancelVoting,
    boardId,
  }),
  /** Creates an action which should be dispatched when a moderator wants to set a timer.
   *
   * @param endDate the date where the timer ends
   */
  setTimer: (endDate: Date) => ({
    type: BoardAction.SetTimer,
    endDate,
  }),
  /**
   * Creates an action which should be dispatched when a moderator wants to cancel the timer.
   */
  cancelTimer: () => ({
    type: BoardAction.CancelTimer,
  }),
};

export type BoardReduxAction =
  | ReturnType<typeof BoardActionFactory.leaveBoard>
  | ReturnType<typeof BoardActionFactory.joinBoard>
  | ReturnType<typeof BoardActionFactory.initializeBoard>
  | ReturnType<typeof BoardActionFactory.editBoard>
  | ReturnType<typeof BoardActionFactory.updatedBoard>
  | ReturnType<typeof BoardActionFactory.deleteBoard>
  | ReturnType<typeof BoardActionFactory.permittedBoardAccess>
  | ReturnType<typeof BoardActionFactory.rejectedBoardAccess>
  | ReturnType<typeof BoardActionFactory.pendingBoardAccessConfirmation>
  | ReturnType<typeof BoardActionFactory.cancelVoting>
  | ReturnType<typeof BoardActionFactory.setTimer>
  | ReturnType<typeof BoardActionFactory.cancelTimer>
  | ReturnType<typeof BoardActionFactory.requirePassphraseChallenge>
  | ReturnType<typeof BoardActionFactory.incorrectPassphrase>;
