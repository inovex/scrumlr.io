import {CreateVotingRequest, Voting} from "types/voting";

export const VotingAction = {
  CreateVoting: "scrumlr.io/createVoting" as const,
  CloseVoting: "scrumlr.io/closeVoting" as const,
  AbortVoting: "scrumlr.io/abortVoting" as const,
  CreatedVoting: "scrumlr.io/createdVoting" as const,
  UpdatedVoting: "scrumlr.io/updatedVoting" as const,
};

export const VotingActionFactory = {
  /**
   * Creates an action which should be dispatched when the user wants to add a vote configuration.
   *
   * @param voting the current vote configuration
   */
  createVoting: (board: string, voting: CreateVotingRequest) => ({
    type: VotingAction.CreateVoting,
    board,
    voting,
  }),

  closeVoting: (voting: string) => ({
    type: VotingAction.CloseVoting,
    voting,
  }),

  abortVoting: (voting: string) => ({
    type: VotingAction.AbortVoting,
    voting,
  }),

  /**
   * Creates an action which should be dispatched when a new vote configuration was created on the server.
   *
   * @param voting the vote configuration added on the server
   */
  createdVoting: (voting: Voting) => ({
    type: VotingAction.CreatedVoting,
    voting,
  }),
  /**
   * Creates an action which should be dispatched when a new vote configuration was removed on the server.
   *
   * @param voting the vote configuration added on the server
   */
  updatedVoting: (voting: Voting) => ({
    type: VotingAction.UpdatedVoting,
    voting,
  }),
};

export type VotingReduxAction =
  | ReturnType<typeof VotingActionFactory.createVoting>
  | ReturnType<typeof VotingActionFactory.closeVoting>
  | ReturnType<typeof VotingActionFactory.abortVoting>
  | ReturnType<typeof VotingActionFactory.createdVoting>
  | ReturnType<typeof VotingActionFactory.updatedVoting>;
