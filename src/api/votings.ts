import { CreateVotingRequest, VotingStatus } from "store/features/votings/types";
import { buildUrl } from "./index";

export const VotingAPI = {
  /**
   * Get all votings for a board
   *
   * @param boardId board id
   *
   * @returns all votings for a board
   */
  getVotings: async (boardId: string): Promise<Voting[]> => {
    try {
      const url = buildUrl(`./boards/${boardId}/votings`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as Voting[];
      }

      throw new Error(`get votings request resulted in response with status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get votings`, { cause: error });
    }
  },

  /**
   * Get a voting for a board
   *
   * @param boardId board id
   * @param votingId voting id
   *
   * @return voting
   */
  getVoting: async (boardId: string, votingId: string): Promise<Voting> => {
    try {
      const url = buildUrl(`./boards/${boardId}/votings/${votingId}`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as Voting;
      }

      throw new Error(`get voting request resulted in response with status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get voting`, { cause: error });
    }
  },

  /**
   * Adds a vote configuration to a board.
   *
   * @param voting the current vote configuration
   *
   * @returns created voting
   */
  createVoting: async (boardId: string, voting: CreateVotingRequest): Promise<Voting> => {
    try {
      const url = buildUrl(`./boards/${boardId}/votings`);
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(voting),
      });

      if (response.status === 201) {
        return (await response.json()) as Voting;
      }

      throw new Error(`create voting request resulted in response with status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to create voting`, { cause: error });
    }
  },

  /**
   * Update a voting
   *
   * @param board board id
   * @param voting voting id
   *
   * @returns updated voting
   */
  changeVotingStatus: async (board: string, voting: string, status?: VotingStatus): Promise<Voting> => {
    try {
      const resolvedStatus: VotingStatus = typeof status === "undefined" || status === null ? "CLOSED" : status;
      const url = buildUrl(`./boards/${board}/votings/${voting}`);
      const response = await fetch(url, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({ status: resolvedStatus }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        return (await response.json()) as Voting;
      }

      throw new Error(`change voting status request resulted in response with status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to change voting status`, { cause: error });
    }
  },
};
