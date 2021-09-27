import {VoteConfiguration, VoteConfigurationClientModel} from "types/voteConfiguration";

export const VoteConfigurationActionType = {
  AddVoteConfiguration: "@@SCRUMLR/addVoteConfiguration" as const,
  AddedVoteConfiguration: "@@SCRUMLR/addedVoteConfiguration" as const,
  RemovedVoteConfiguration: "@@SCRUMLR/removedVoteConfiguration" as const,
  InitializeVoteConfiguration: "@@SCRUMLR/initializeVoteConfiguration" as const,
};

export const VoteConfigurationActionFactory = {
  /**
   * Creates an action which should be dispatched when the user wants to add a vote configuration.
   *
   * @param voteConfiguration the current vote configuration
   */
  addVoteConfiguration: (voteConfiguration: VoteConfiguration) => ({
    type: VoteConfigurationActionType.AddVoteConfiguration,
    voteConfiguration,
  }),
  /**
   * Creates an action which should be dispatched when a new vote configuration was created on the server.
   *
   * @param voteConfiguration the vote configuration added on the server
   */
  addedVoteConfiguration: (voteConfiguration: VoteConfigurationClientModel) => ({
    type: VoteConfigurationActionType.AddedVoteConfiguration,
    voteConfiguration,
  }),
  /**
   * Creates an action which should be dispatched when a new vote configuration was removed on the server.
   *
   * @param voteConfiguration the vote configuration added on the server
   */
  removedVoteConfiguration: (voteConfiguration: VoteConfigurationClientModel) => ({
    type: VoteConfigurationActionType.RemovedVoteConfiguration,
    voteConfiguration,
  }),
  /**
   * Creates an action which should be dispatched when the server returns the las vote configuration
   *
   * @param voteConfiguration current vote configuration (e.g. a user can join during voting phase)
   */
  initializeVoteConfiguration: (voteConfiguration: VoteConfigurationClientModel) => ({
    type: VoteConfigurationActionType.InitializeVoteConfiguration,
    voteConfiguration,
  }),
};

export type VoteConfigurationReduxAction =
  | ReturnType<typeof VoteConfigurationActionFactory.addVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.addedVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.removedVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.initializeVoteConfiguration>;
