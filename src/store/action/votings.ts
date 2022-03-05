import {CreateVotingRequest, Voting} from "types/voting";

export const VotingAction = {
  CreateVoting: "scrumlr.io/createVoting" as const,
  CloseVoting: "scrumlr.io/closeVoting" as const,
  AbortVoting: "scrumlr.io/abortVoting" as const,
  AddedVoteConfiguration: "scrumlr.io/addedVoteConfiguration" as const,
  RemovedVoteConfiguration: "scrumlr.io/removedVoteConfiguration" as const,
  InitializeVoteConfiguration: "scrumlr.io/initializeVoteConfiguration" as const,
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

  closeVoting: (board: string, voting: string) => ({
    type: VotingAction.CloseVoting,
  }),

  abortVoting: (board: string, voting: string) => ({
    type: VotingAction.AbortVoting,
  }),

  /**
   * Creates an action which should be dispatched when a new vote configuration was created on the server.
   *
   * @param voteConfiguration the vote configuration added on the server
   */
  addedVoteConfiguration: (voteConfiguration: Voting) => ({
    type: VotingAction.AddedVoteConfiguration,
    voteConfiguration,
  }),
  /**
   * Creates an action which should be dispatched when a new vote configuration was removed on the server.
   *
   * @param voteConfiguration the vote configuration added on the server
   */
  removedVoteConfiguration: (voteConfiguration: Voting) => ({
    type: VotingAction.RemovedVoteConfiguration,
    voteConfiguration,
  }),
  /**
   * Creates an action which should be dispatched when the server returns the las vote configuration
   *
   * @param voteConfiguration current vote configuration (e.g. a user can join during voting phase)
   */
  initializeVoteConfiguration: (voteConfiguration: Voting) => ({
    type: VotingAction.InitializeVoteConfiguration,
    voteConfiguration,
  }),
};

export type VoteConfigurationReduxAction =
  | ReturnType<typeof VotingActionFactory.createVoting>
  | ReturnType<typeof VotingActionFactory.closeVoting>
  | ReturnType<typeof VotingActionFactory.abortVoting>
  | ReturnType<typeof VotingActionFactory.addedVoteConfiguration>
  | ReturnType<typeof VotingActionFactory.removedVoteConfiguration>
  | ReturnType<typeof VotingActionFactory.initializeVoteConfiguration>;
