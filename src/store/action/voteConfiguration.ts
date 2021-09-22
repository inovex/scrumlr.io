import {VoteConfiguration, VoteConfigurationClientModel} from "types/voteConfiguration";

export const VoteConfigurationActionType = {
  AddVoteConfiguration: "@@SCRUMLR/addVoteConfiguration" as const,
  AddedVoteConfiguration: "@@SCRUMLR/addedVoteConfiguration" as const,
  RemoveVoteConfiguration: "@@SCRUMLR/removeVoteConfiguration" as const,
  RemovedVoteConfiguration: "@@SCRUMLR/removedVoteConfiguration" as const,
  UpdateVoteConfiguration: "@@SCRUMLR/updateVoteConfiguration" as const,
  UpdatedVoteConfiguration: "@@SCRUMLR/updatedVoteConfiguration" as const,
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
   * Creates an action which should be dispatched when the user/admin wants to remove a vote configuration.
   *
   * @param boardId the current board id
   */
  removeVoteConfiguration: (boardId: string) => ({
    type: VoteConfigurationActionType.RemoveVoteConfiguration,
    boardId,
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
   * Creates an action which should be dispatched when the user wants to update a vote configuration.
   *
   * @param voteConfiguration the current updated vote configuration
   */
  updateVoteConfiguration: (voteConfiguration: VoteConfiguration) => ({
    type: VoteConfigurationActionType.UpdateVoteConfiguration,
    voteConfiguration,
  }),
  /**
   * Creates an action which should be dispatched when a vote configuration was updated on the server.
   *
   * @param voteConfiguration the vote configuration updated on the server
   */
  updatedVoteConfiguration: (voteConfiguration: VoteConfigurationClientModel) => ({
    type: VoteConfigurationActionType.UpdatedVoteConfiguration,
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
  | ReturnType<typeof VoteConfigurationActionFactory.removeVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.removedVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.initializeVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.updateVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.updatedVoteConfiguration>;
