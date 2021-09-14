import {UpdateVoteConfiguration, VoteConfigurationClientModel} from "types/voteConfiguration";

export const VoteConfigurationActionType = {
  AddVoteConfiguration: "@@SCRUMLR/addVoteConfiguration" as const,
  AddedVoteConfiguration: "@@SCRUMLR/addedVoteConfiguration" as const,
  UpdateVoteConfiguration: "@@SCRUMLR/updateVoteConfiguration" as const,
  UpdatedVoteConfiguration: "@@SCRUMLR/updatedVoteConfiguration" as const,
  RemoveVoteConfiguration: "@@SCRUMLR/removeVoteConfiguration" as const,
  RemovedVoteConfiguration: "@@SCRUMLR/removedVoteConfiguration" as const,
  InitializeVoteConfigurations: "@@SCRUMLR/initializeVoteConfigurations" as const,
};

export const VoteConfigurationActionFactory = {
  addVoteConfiguration: (board: string, voteConfiguration: UpdateVoteConfiguration) => ({
    type: VoteConfigurationActionType.AddVoteConfiguration,
    board,
    voteConfiguration,
  }),
  addedVoteConfiguration: (voteConfiguration: VoteConfigurationClientModel) => ({
    type: VoteConfigurationActionType.AddedVoteConfiguration,
    voteConfiguration,
  }),
  updateVoteConfiguration: (voteConfiguration: UpdateVoteConfiguration) => ({
    type: VoteConfigurationActionType.UpdateVoteConfiguration,
    voteConfiguration,
  }),
  removeVoteConfiguration: (board: string) => ({
    type: VoteConfigurationActionType.RemoveVoteConfiguration,
    board,
  }),
  removedVoteConfiguration: (voteConfiguration: VoteConfigurationClientModel) => ({
    type: VoteConfigurationActionType.RemovedVoteConfiguration,
    voteConfiguration,
  }),
  initializeVoteConfigurations: (voteConfigurations: VoteConfigurationClientModel[]) => ({
    type: VoteConfigurationActionType.InitializeVoteConfigurations,
    voteConfigurations,
  }),
};

export type VoteConfigurationReduxAction =
  | ReturnType<typeof VoteConfigurationActionFactory.addVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.addedVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.updateVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.removeVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.removedVoteConfiguration>
  | ReturnType<typeof VoteConfigurationActionFactory.initializeVoteConfigurations>;
