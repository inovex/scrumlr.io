import {CreateVotingRequest, Voting} from "types/voting";

export const VoteConfigurationActionType = {
  CreateVoting: "@@SCRUMLR/createVoting" as const,
  CloseVoting: "@@SCRUMLR/closeVoting" as const,
  AbortVoting: "@@SCRUMLR/abortVoting" as const,
  AddedVoteConfiguration: "@@SCRUMLR/addedVoteConfiguration" as const,
  RemovedVoteConfiguration: "@@SCRUMLR/removedVoteConfiguration" as const,
  InitializeVoteConfiguration: "@@SCRUMLR/initializeVoteConfiguration" as const,
};

export const VoteConfigurationActionFactory = {
  /**
   * Creates an action which should be dispatched when the user wants to add a vote configuration.
   *
   * @param voting the current vote configuration
   */
  createVoting: (board: string, voting: CreateVotingRequest) => ({
    type: VoteConfigurationActionType.CreateVoting,
    board,
    voting,
  }),

  closeVoting: (board: string, voting: string) => ({
    type: VoteConfigurationActionType.CloseVoting,
  }),

  abortVoting: (board: string, voting: string) => ({
    type: VoteConfigurationActionType.AbortVoting,
  }),

  /**
   * Creates an action which should be dispatched when a new vote configuration was created on the server.
   *
   * @param voteConfiguration the vote configuration added on the server
   */
  addedVoteConfiguration: (voteConfiguration: Voting) => ({
    type: VoteConfigurationActionType.AddedVoteConfiguration,
    voteConfiguration,
  }),
  /**
   * Creates an action which should be dispatched when a new vote configuration was removed on the server.
   *
   * @param voteConfiguration the vote configuration added on the server
   */
  removedVoteConfiguration: (voteConfiguration: Voting) => ({
    type: VoteConfigurationActionType.RemovedVoteConfiguration,
    voteConfiguration,
  }),
  /**
   * Creates an action which should be dispatched when the server returns the las vote configuration
   *
   * @param voteConfiguration current vote configuration (e.g. a user can join during voting phase)
   */
  initializeVoteConfiguration: (voteConfiguration: Voting) => ({
    type: VoteConfigurationActionType.InitializeVoteConfiguration,
    voteConfiguration,
  }),
};

export type VoteConfigurationReduxAction =
  | ReturnType<typeof VoteConfigurationActionFactory.createVoting>
  | ReturnType<typeof VoteConfigurationActionFactory.closeVoting>
  | ReturnType<typeof VoteConfigurationActionFactory.abortVoting>
  | ReturnType<typeof VoteConfigurationActionFactory.addedVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.removedVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.initializeVoteConfiguration>;
