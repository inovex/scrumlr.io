import {Vote} from "types/vote";

export const VoteAction = {
  AddVote: "scrumlr.io/addVote" as const,
  CreatedVote: "scrumlr.io/createdVote" as const,
  DeleteVote: "scrumlr.io/deleteVote" as const,
  DeletedVote: "scrumlr.io/deletedVote" as const,
};

export const VoteActionFactory = {
  addVote: (note: string) => ({
    type: VoteAction.AddVote,
    note,
  }),
  deleteVote: (note: string) => ({
    type: VoteAction.DeleteVote,
    note,
  }),

  createdVote: (vote: Vote) => ({
    type: VoteAction.CreatedVote,
    vote,
  }),
  deletedVote: (vote: Vote) => ({
    type: VoteAction.DeletedVote,
    vote,
  }),
};

export type VoteReduxAction =
  | ReturnType<typeof VoteActionFactory.addVote>
  | ReturnType<typeof VoteActionFactory.deleteVote>
  | ReturnType<typeof VoteActionFactory.createdVote>
  | ReturnType<typeof VoteActionFactory.deletedVote>;
