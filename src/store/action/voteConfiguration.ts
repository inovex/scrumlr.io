import {UpdateVoteConfiguration, VoteConfigurationClientModel} from "types/voteConfiguration";

export const VoteConfigurationActionType = {
  /*
   * ATTENTION:
   * Don't forget the `as` casting for each field, because the type inference
   * won't work otherwise (e.g. in reducers).
   */
  AddVoteConfiguration: "@@SCRUMLR/addVoteConfiguration" as const,
  UpdateVoteConfiguration: "@@SCRUMLR/updateVoteConfiguration" as const,
  RemoveVoteConfiguration: "@@SCRUMLR/removeVoteConfiguration" as const,
  RemovedVoteConfiguration: "@@SCRUMLR/removedVoteConfiguration" as const,
  AddedVoteConfiguration: "@@SCRUMLR/addedVoteConfiguration" as const,
  UpdatedVoteConfiguration: "@@SCRUMLR/updatedVoteConfiguration" as const,
};

export const VoteConfigurationActionFactory = {
  /**
   *
   *
   *
   * @param board
   * @param voteConfiguration
   */
  addVoteConfiguration: (board: string, voteConfiguration: UpdateVoteConfiguration) => ({
    type: VoteConfigurationActionType.AddVoteConfiguration,
    board,
    voteConfiguration,
  }),

  /**
   *
   *
   *
   */
  addedVoteConfiguration: (voteConfiguration: VoteConfigurationClientModel) => ({
    type: VoteConfigurationActionType.AddedVoteConfiguration,
    voteConfiguration,
  }),

  /**
   *
   *
   *
   * @param voteConfiguration
   */
  updateVoteConfiguration: (voteConfiguration: UpdateVoteConfiguration) => ({
    type: VoteConfigurationActionType.UpdateVoteConfiguration,
    voteConfiguration,
  }),

  /**
   *
   *
   *
   * @param board
   */
  removeVoteConfiguration: (board: string) => ({
    type: VoteConfigurationActionType.RemoveVoteConfiguration,
    board,
  }),

  /**
   *
   *
   *
   * @param board
   */
  removedVoteConfiguration: (voteConfiguration: VoteConfigurationClientModel) => ({
    type: VoteConfigurationActionType.RemovedVoteConfiguration,
    voteConfiguration,
  }),
};

export type VoteConfigurationReduxAction =
  | ReturnType<typeof VoteConfigurationActionFactory.addVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.addedVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.updateVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.removeVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.removedVoteConfiguration>;
