import {callAPI} from "./callApi";
import {VoteConfiguration} from "../types/voteConfiguration";

export const VoteConfigurationAPI = {
  addVoteConfiguration: (board: string, voteConfiguration: VoteConfiguration) => callAPI("addVoteConfiguration", {board, voteConfiguration}),
  updateVoteConfiguration: (voteConfiguration: VoteConfiguration) => callAPI("updateVoteConfiguration", {voteConfiguration}),
  removeVoteConfiguration: (board: string) => callAPI("removeVoteConfiguration", {board}),
};
