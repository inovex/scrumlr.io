import type http from "k6/http";
import type { Vote } from "../../types/vote.ts";
import { BaseClient, type QueryParameter } from "../baseClient.ts";
import type { CreateVoteRequest } from "./requests.ts";

export class VoteClient extends BaseClient {
	/**
	 * Create a vote on a board
	 *
	 * This calls `POST /boards/{id}/votes`
	 * @param boardId id of the board
	 * @param voteReq vote to create
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the created vote and the response
	 */
	createVote(boardId: string, voteReq: CreateVoteRequest, cookieJar?: http.CookieJar): [Vote | null, http.Response] {
		const response = this.post(`./boards/${boardId}/votes`, voteReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const vote: Vote = response.json() as unknown as Vote;
		return [vote, response];
	}

	/**
	 * Get all votes for a board
	 *
	 * This calls `GET /boards/{id}/votes`
	 * @param boardId id of the board
	 * @param votingId id of the voting to filter
	 * @param noteId id of the note to filter
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the votes for the board and the response
	 */
	getVotes(
		boardId: string,
		votingId: string | null = null,
		noteId: string | null = null,
		cookieJar?: http.CookieJar,
	): [Vote[] | null, http.Response] {
		const queryParameter: QueryParameter[] = [
			{ key: "voting", value: votingId },
			{ key: "note", value: noteId },
		];

		const response = this.get(`./boards/${boardId}/votes`, queryParameter, cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const votes: Vote[] = response.json() as unknown as Vote[];
		return [votes, response];
	}

	/**
	 * Delete a vote from a board
	 *
	 * This calls `DELETE /boards/{id}/votes`
	 * @param boardId id of the board
	 * @param voteReq vote to delete
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the response
	 */
	deleteVote(boardId: string, voteReq: CreateVoteRequest, cookieJar?: http.CookieJar): http.Response {
		const response = this.del(`./boards/${boardId}/votes`, voteReq, [], cookieJar);
		return response;
	}
}
