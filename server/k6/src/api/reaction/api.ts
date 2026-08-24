import type http from "k6/http";
import type { Reaction } from "../../types/reaction.ts";
import { BaseClient } from "../baseClient.ts";
import type { CreateReactionRequest, UpdateReactionRequest } from "./requests.ts";

export class ReactionClient extends BaseClient {
	createReaction(
		boardId: string,
		reactReq: CreateReactionRequest,
		cookieJar?: http.CookieJar,
	): [Reaction | null, http.Response] {
		const response = this.post(`/boards/${boardId}/reactions`, reactReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const reaction: Reaction = response.json() as unknown as Reaction;
		return [reaction, response];
	}

	getReactions(boardId: string, cookieJar?: http.CookieJar): [Reaction[] | null, http.Response] {
		const response = this.get(`/boards/${boardId}/reactions`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const reaction: Reaction[] = response.json() as unknown as Reaction[];
		return [reaction, response];
	}

	getReaction(boardId: string, reactionId: string, cookieJar?: http.CookieJar): [Reaction | null, http.Response] {
		const response = this.get(`/boards/${boardId}/reactions/${reactionId}`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const reaction: Reaction = response.json() as unknown as Reaction;
		return [reaction, response];
	}

	updateReaction(
		boardId: string,
		reactionId: string,
		updateReq: UpdateReactionRequest,
		cookieJar?: http.CookieJar,
	): [Reaction | null, http.Response] {
		const response = this.put(`/boards/${boardId}/reactions/${reactionId}`, updateReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const reaction: Reaction = response.json() as unknown as Reaction;
		return [reaction, response];
	}

	deleteReaction(boardId: string, reactionId: string, cookieJar?: http.CookieJar): http.Response {
		const response = this.del(`/boards/${boardId}/reactions/${reactionId}`, null, [], cookieJar);
		return response;
	}
}
