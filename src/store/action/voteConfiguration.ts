import {UpdateVoteConfiguration} from "../../types/voteConfiguration";

export const VoteConfigurationActionType = {
  /*
   * ATTENTION:
   * Don't forget the `as` casting for each field, because the type inference
   * won't work otherwise (e.g. in reducers).
   */
  AddVoteConfiguration: "@@SCRUMLR/addVoteConfiguration" as const,
  UpdateVoteConfiguration: "@@SCRUMLR/updateVoteConfiguration" as const,
  RemoveVoteConfiguration: "@@SCRUMLR/removeVoteConfiguration" as const,
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
};

export type VoteConfigurationReduxAction =
  | ReturnType<typeof VoteConfigurationActionFactory.addVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.updateVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.removeVoteConfiguration>;
