import {callAPI} from "./callApi";
import {VoteConfiguration} from "../types/voteConfiguration";

export const VoteConfigurationAPI = {
  /**
   * Adds a vote configuration to a board.
   *
   * @param voteConfiguration the current vote configuration
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  addVoteConfiguration: (voteConfiguration: VoteConfiguration) => callAPI("addVoteConfiguration", {voteConfiguration}),
  /**
   * Removes a vote configuration from the board (e.g. we cancle the current voting iteration and don't want to store it for analysis).
   *
   * @param board the boardId of the current board
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  removeVoteConfiguration: (boardId: string) => callAPI("removeVoteConfiguration", {boardId}),
  /**
   * Updates a vote configuration.
   *
   * @param voteConfiguration the current vote configuration
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  updateVoteConfiguration: (voteConfiguration: VoteConfiguration) => callAPI("updateVoteConfiguration", {voteConfiguration}),
};
