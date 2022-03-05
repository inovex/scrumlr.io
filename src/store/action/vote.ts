import {Vote} from "types/vote";

export const VoteActionType = {
  AddVote: "@@SCRUMLR/addVote" as const,
  CreatedVote: "@@SCRUMLR/createdVote" as const,
  DeleteVote: "@@SCRUMLR/deleteVote" as const,
  DeletedVote: "@@SCRUMLR/deletedVote" as const,
  InitializeVotes: "@@SCRUMLR/initializeVotes" as const,
};

export const VoteActionFactory = {
  addVote: (note: string, boardId: string) => ({
    type: VoteActionType.AddVote,
    note,
    boardId,
  }),
  deleteVote: (note: string) => ({
    type: VoteActionType.DeleteVote,
    note,
  }),
  createdVote: (vote: Vote) => ({
    type: VoteActionType.CreatedVote,
    vote,
  }),
  deletedVote: (voteId: string) => ({
    type: VoteActionType.DeletedVote,
    voteId,
  }),
  initializeVotes: (votes: Vote[]) => ({
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
