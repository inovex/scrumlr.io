import {VoteClientModel} from "types/vote";

export const VoteActionType = {
  AddVote: "@@SCRUMLR/addVote" as const,
  CreatedVote: "@@SCRUMLR/createdVote" as const,
  DeleteVote: "@@SCRUMLR/deleteVote" as const,
  DeletedVote: "@@SCRUMLR/deletedVote" as const,
  InitializeVotes: "@@SCRUMLR/initializeVotes" as const,
};

export const VoteActionFactory = {
  addVote: (note: string) => ({
    type: VoteActionType.AddVote,
    note,
  }),
  deleteVote: (note: string) => ({
    type: VoteActionType.DeleteVote,
    note,
  }),
  createdVote: (vote: VoteClientModel) => ({
    type: VoteActionType.CreatedVote,
    vote,
  }),
  deletedVote: (voteId: string) => ({
    type: VoteActionType.DeletedVote,
    voteId,
  }),
  initializeVotes: (votes: VoteClientModel[]) => ({
    type: VoteActionType.InitializeVotes,
    votes,
  }),
};

export type VoteReduxAction =
  | ReturnType<typeof VoteActionFactory.addVote>
  | ReturnType<typeof VoteActionFactory.deleteVote>
  | ReturnType<typeof VoteActionFactory.createdVote>
  | ReturnType<typeof VoteActionFactory.deletedVote>
  | ReturnType<typeof VoteActionFactory.initializeVotes>;
