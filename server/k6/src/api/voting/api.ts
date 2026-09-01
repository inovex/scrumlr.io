import type http from "k6/http";
import type { Voting } from "../../types/voting.ts";
import { BaseClient } from "../baseClient.ts";
import type { CreateVotingRequest, UpdateVotingRequest } from "./requests.ts";

export class VotingClient extends BaseClient {
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

	getVotings(boardId: string, cookieJar?: http.CookieJar): [Voting[], http.Response] {
		const response = this.get(`./boards/${boardId}/votings`, [], cookieJar);
		if (response.error_code) {
			return [[], response];
		}

		const voting: Voting[] = response.json() as unknown as Voting[];
		return [voting, response];
	}

	getVoting(boardId: string, votingId: string, cookieJar?: http.CookieJar): [Voting | null, http.Response] {
		const response = this.get(`./boards/${boardId}/votings/${votingId}`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const voting: Voting = response.json() as unknown as Voting;
		return [voting, response];
	}

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
