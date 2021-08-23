import {callAPI} from "./callApi";

export const VoteAPI = {
  addVote: (board: string, note: string) => callAPI("addVote", {board, note}),
  deleteVote: (board: string, note: string) => callAPI("removeVote", {board, note}),
};
