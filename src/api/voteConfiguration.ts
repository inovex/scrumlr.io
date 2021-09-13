import {callAPI} from "./callApi";
import {UpdateVoteConfiguration} from "../types/voteConfiguration";

export const VoteConfigurationAPI = {
  addVoteConfiguration: (board: string, voteConfiguration: UpdateVoteConfiguration) => callAPI("addVoteConfiguration", {board, voteConfiguration}),
  updateVoteConfiguration: (voteConfiguration: UpdateVoteConfiguration) => callAPI("updateVoteConfiguration", {voteConfiguration}),
  removeVoteConfiguration: (board: string) => callAPI("removeVoteConfiguration", {board}),
};
