import {CreateVotingRequest} from "types/voting";
import {SERVER_HTTP_URL} from "../config";

export const VotingAPI = {
  /**
   * Adds a vote configuration to a board.
   *
   * @param voting the current vote configuration
   *
   * @returns `true` if the operation succeeded or throws an error otherwise
   */
  createVoting: async (board: string, voting: CreateVotingRequest) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${board}/votings`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(voting),
      });

      if (response.status === 201) {
        return await response.json();
      }

      throw new Error(`create voting request resulted in response with status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to create voting: ${error}`);
    }
  },

  changeVotingStatus: async (board: string, voting: string, status: "CLOSED") => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${board}/votings/${voting}`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({status}),
      });

      if (response.status === 200) {
        return await response.json();
      }

      throw new Error(`change voting status request resulted in response with status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to change voting status: ${error}`);
    }
  },
};
