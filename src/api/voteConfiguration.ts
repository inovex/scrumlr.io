import {VoteConfiguration} from "types/voteConfiguration";
import {callAPI} from "./callApi";

export const VoteConfigurationAPI = {
  /**
   * Adds a vote configuration to a board.
   *
   * @param voteConfiguration the current vote configuration
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  addVoteConfiguration: (voteConfiguration: VoteConfiguration) => callAPI("addVoteConfiguration", {voteConfiguration}),
};
