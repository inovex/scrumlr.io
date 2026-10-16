import type http from "k6/http";
import type { Voting } from "../../types/voting.ts";
import { BaseClient } from "../baseClient.ts";
import type { CreateVotingRequest, UpdateVotingRequest } from "./requests.ts";

export class VotingClient extends BaseClient {
	/**
	 * Create a voting on a board
	 *
	 * This calls `POST /boards/{id}/votings`
	 * @param boardId id of the board
	 * @param request voting to create
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the created voting and the response
	 */
	createVoting(
		boardId: string,
		request: CreateVotingRequest,
		cookieJar?: http.CookieJar,
	): [Voting | null, http.Response] {
		const response = this.post(`./boards/${boardId}/votings`, request, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const voting: Voting = response.json() as unknown as Voting;
		return [voting, response];
	}

	/**
	 * Get all votings from a board
	 *
	 * This calls `GET /boards/{id}/votings`
	 * @param boardId id of the board
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the votings and the response
	 */
	getVotings(boardId: string, cookieJar?: http.CookieJar): [Voting[] | null, http.Response] {
		const response = this.get(`./boards/${boardId}/votings`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const voting: Voting[] = response.json() as unknown as Voting[];
		return [voting, response];
	}

	/**
	 * Get a voting for a board
	 *
	 * This calls `GET /boards/{id}/votings/{id}`
	 * @param boardId id of the board
	 * @param votingId id of the voting
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the voting and the response
	 */
	getVoting(boardId: string, votingId: string, cookieJar?: http.CookieJar): [Voting | null, http.Response] {
		const response = this.get(`./boards/${boardId}/votings/${votingId}`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const voting: Voting = response.json() as unknown as Voting;
		return [voting, response];
	}

	/**
	 * Update a voting on a board
	 *
	 * This calls `PUT /boards/{id}/votings/{id}`
	 * @param boardId id of the board
	 * @param votingId id of the voting
	 * @param request values to update the voting
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the updated voting and the response
	 */
	updateVoting(
		boardId: string,
		votingId: string,
		request: UpdateVotingRequest,
		cookieJar?: http.CookieJar,
	): [Voting | null, http.Response] {
		const response = this.put(`./boards/${boardId}/votings/${votingId}`, request, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const voting: Voting = response.json() as unknown as Voting;
		return [voting, response];
	}
}
