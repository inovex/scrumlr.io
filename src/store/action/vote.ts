import {Vote} from "types/vote";

export const VoteAction = {
  AddVote: "scrumlr.io/addVote" as const,
  CreatedVote: "scrumlr.io/createdVote" as const,
  DeleteVote: "scrumlr.io/deleteVote" as const,
  DeletedVote: "scrumlr.io/deletedVote" as const,
  InitializeVotes: "scrumlr.io/initializeVotes" as const,
};

export const VoteActionFactory = {
  addVote: (note: string, boardId: string) => ({
    type: VoteAction.AddVote,
    note,
    boardId,
  }),
  deleteVote: (note: string) => ({
    type: VoteAction.DeleteVote,
    note,
  }),
  createdVote: (vote: Vote) => ({
    type: VoteAction.CreatedVote,
    vote,
  }),
  deletedVote: (voteId: string) => ({
    type: VoteAction.DeletedVote,
    voteId,
  }),
  initializeVotes: (votes: Vote[]) => ({
    type: VoteAction.InitializeVotes,
    votes,
  }),
};

export type VoteReduxAction =
  | ReturnType<typeof VoteActionFactory.addVote>
  | ReturnType<typeof VoteActionFactory.deleteVote>
  | ReturnType<typeof VoteActionFactory.createdVote>
  | ReturnType<typeof VoteActionFactory.deletedVote>
  | ReturnType<typeof VoteActionFactory.initializeVotes>;
