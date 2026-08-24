import type http from "k6/http";
import type { Vote } from "../../types/vote.ts";
import { BaseClient, type QueryParameter } from "../baseClient.ts";
import type { CreateVoteRequest } from "./requests.ts";

export class VoteClient extends BaseClient {
	createVote(boardId: string, voteReq: CreateVoteRequest, cookieJar?: http.CookieJar): http.Response {
		return this.post(`/boards/${boardId}/votes`, voteReq, [], cookieJar);
	}

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

		const response = this.get(`/boards/${boardId}/votes`, queryParameter, cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const votes: Vote[] = response.json() as unknown as Vote[];
		return [votes, response];
	}

	deleteVote(boardId: string, voteReq: CreateVoteRequest, cookieJar?: http.CookieJar): http.Response {
		const response = this.del(`/boards/${boardId}/votes`, voteReq, [], cookieJar);
		return response;
	}
}
