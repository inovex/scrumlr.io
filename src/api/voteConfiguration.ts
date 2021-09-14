import {callAPI} from "./callApi";
import {VoteConfiguration} from "../types/voteConfiguration";

export const VoteConfigurationAPI = {
  addVoteConfiguration: (voteConfiguration: VoteConfiguration) => callAPI("addVoteConfiguration", {voteConfiguration}),
  updateVoteConfiguration: (voteConfiguration: VoteConfiguration) => callAPI("updateVoteConfiguration", {voteConfiguration}),
  removeVoteConfiguration: (board: string) => callAPI("removeVoteConfiguration", {board}),
};
