import type http from "k6/http";
import type { Reaction } from "../../types/reaction.ts";
import { BaseClient } from "../baseClient.ts";
import type { CreateReactionRequest, UpdateReactionRequest } from "./requests.ts";

export class ReactionClient extends BaseClient {
	/**
	 * Create a reaction on a board
	 *
	 * This calls `POST /boards/{id}/reactions`
	 * @param boardId id of the board
	 * @param reactReq reaction to create
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the created reaction and the response
	 */
	createReaction(
		boardId: string,
		reactReq: CreateReactionRequest,
		cookieJar?: http.CookieJar,
	): [Reaction | null, http.Response] {
		const response = this.post(`./boards/${boardId}/reactions`, reactReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const reaction: Reaction = response.json() as unknown as Reaction;
		return [reaction, response];
	}

	/**
	 * Get all reactions for a board
	 *
	 * This calls `GET /boards/{id}/reactions`
	 * @param boardId id of the board
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the reactions and the response
	 */
	getReactions(boardId: string, cookieJar?: http.CookieJar): [Reaction[] | null, http.Response] {
		const response = this.get(`./boards/${boardId}/reactions`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const reaction: Reaction[] = response.json() as unknown as Reaction[];
		return [reaction, response];
	}

	/**
	 * Get a reaction from a board
	 *
	 * This calls `GET /boards/{id}/reactions/{id}`
	 * @param boardId id of the board
	 * @param reactionId id of the reaction
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the reaction and the response
	 */
	getReaction(boardId: string, reactionId: string, cookieJar?: http.CookieJar): [Reaction | null, http.Response] {
		const response = this.get(`./boards/${boardId}/reactions/${reactionId}`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const reaction: Reaction = response.json() as unknown as Reaction;
		return [reaction, response];
	}

	/**
	 * Update a reaction on a board
	 *
	 * This calls `PUT /boards/{id}/reactions/{id}`
	 * @param boardId id of the board
	 * @param reactionId id of the reaction
	 * @param updateReq vales to update the reaction
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the updated reaction and the response
	 */
	updateReaction(
		boardId: string,
		reactionId: string,
		updateReq: UpdateReactionRequest,
		cookieJar?: http.CookieJar,
	): [Reaction | null, http.Response] {
		const response = this.put(`./boards/${boardId}/reactions/${reactionId}`, updateReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const reaction: Reaction = response.json() as unknown as Reaction;
		return [reaction, response];
	}

	/**
	 * Delete a reaction from a board
	 *
	 * This calls `DELETE /boards/{id}/reactions`
	 * @param boardId id of the board
	 * @param reactionId id of the reaction
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the response
	 */
	deleteReaction(boardId: string, reactionId: string, cookieJar?: http.CookieJar): http.Response {
		const response = this.del(`./boards/${boardId}/reactions/${reactionId}`, null, [], cookieJar);
		return response;
	}
}
