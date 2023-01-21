import {Board, EditBoardRequest} from "types/board";
import {Column} from "types/column";
import {Participant} from "types/participant";
import {Note} from "types/note";
import {Vote} from "types/vote";
import {Voting} from "types/voting";
import {Request} from "types/request";

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
  UpdatedBoardTimer: "scrumlr.io/updatedBoardTimer" as const,
  DeleteBoard: "scrumlr.io/deleteBoard" as const,
  PermittedBoardAccess: "scrumlr.io/permittedBoardAccess" as const,
  RejectedBoardAccess: "scrumlr.io/rejectedBoardAccess" as const,
  PendingBoardAccessConfirmation: "scrumlr.io/pendingBoardAccessConfirmation" as const,
  PassphraseChallengeRequired: "scrumlr.io/passphraseChallengeRequired" as const,
  TooManyJoinRequests: "scrumlr.io/tooManyJoinRequests" as const,
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
  initializeBoard: (board: Board, participants: Participant[], requests: Request[], columns: Column[], notes: Note[], votes: Vote[], votings: Voting[]) => ({
    type: BoardAction.InitializeBoard,
    board,
    participants,
    requests,
    columns,
    notes,
    votes,
    votings,
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
  updatedBoardTimer: (board: Board) => ({
    type: BoardAction.UpdatedBoardTimer,
    board,
  }),
  /** Creates an action which should be dispatched when the user wants to delete the current board. */
  deleteBoard: () => ({
    type: BoardAction.DeleteBoard,
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
  pendingBoardAccessConfirmation: (board: string, requestReference: string) => ({
    type: BoardAction.PendingBoardAccessConfirmation,
    board,
    requestReference,
  }),
  requirePassphraseChallenge: () => ({
    type: BoardAction.PassphraseChallengeRequired,
  }),
  tooManyJoinRequests: () => ({
    type: BoardAction.TooManyJoinRequests,
  }),
  setTimer: (minutes: number) => ({
    type: BoardAction.SetTimer,
    minutes,
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
  | ReturnType<typeof BoardActionFactory.updatedBoardTimer>
  | ReturnType<typeof BoardActionFactory.deleteBoard>
  | ReturnType<typeof BoardActionFactory.permittedBoardAccess>
  | ReturnType<typeof BoardActionFactory.rejectedBoardAccess>
  | ReturnType<typeof BoardActionFactory.pendingBoardAccessConfirmation>
  | ReturnType<typeof BoardActionFactory.setTimer>
  | ReturnType<typeof BoardActionFactory.cancelTimer>
  | ReturnType<typeof BoardActionFactory.requirePassphraseChallenge>
  | ReturnType<typeof BoardActionFactory.tooManyJoinRequests>;
