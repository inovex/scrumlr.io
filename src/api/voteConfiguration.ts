import {callAPI} from "./callApi";
import {VoteConfiguration} from "../types/voteConfiguration";

export const VoteConfigurationAPI = {
  addVoteConfiguration: (voteConfiguration: VoteConfiguration) => callAPI("addVoteConfiguration", {voteConfiguration}),
  removeVoteConfiguration: (board: string) => callAPI("removeVoteConfiguration", {board}),
};
