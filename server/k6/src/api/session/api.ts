import type http from "k6/http";
import type { Role } from "../../types/roles.ts";
import type { BoardSession } from "../../types/session.ts";
import { BaseClient, type QueryParameter } from "../baseClient.ts";
import type { BoardSessionsUpdateRequest, BoardSessionUpdateRequest } from "./requests.ts";

export class SessionClient extends BaseClient {
	/**
	 * Get all sessions on aboard with the given filters
	 *
	 * This calls `GET /boards/${boardId}/participants`
	 * @param boardId id of the board
	 * @param connected if the participant should be connected
	 * @param ready if the participant should be ready
	 * @param raisedHand if the participant should have raised their hand
	 * @param role the role the participant should have
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the participants and the response
	 */
	getParticipants(
		boardId: string,
		connected: boolean | null = null,
		ready: boolean | null = null,
		raisedHand: boolean | null = null,
		role: Role | null = null,
		cookieJar?: http.CookieJar,
	): [BoardSession[], http.Response] {
		const queryparams: QueryParameter[] = [
			{ key: "connected", value: connected },
			{ key: "ready", value: ready },
			{ key: "raisedHand", value: raisedHand },
			{ key: "role", value: role },
		];

		const response = this.get(`./boards/${boardId}/participants`, queryparams, cookieJar);
		if (response.error_code) {
			return [[], response];
		}

		const sessions: BoardSession[] = response.json() as unknown as BoardSession[];
		return [sessions, response];
	}

	/**
	 * Get a session from a board
	 *
	 * This calls `GET /boards/${boardId}/participants/{id}`
	 * @param boardId id of the board
	 * @param userId id of the user
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the session and the response
	 */
	getParticipant(boardId: string, userId: string, cookieJar?: http.CookieJar): [BoardSession | null, http.Response] {
		const response = this.get(`./boards/${boardId}/participants/${userId}`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const session: BoardSession = response.json() as unknown as BoardSession;
		return [session, response];
	}

	/**
	 * Update all session on a board
	 *
	 * This calls `PUT /boards/{id}/participants`
	 * @param boardId id of the board
	 * @param updateReq session update values
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the updated sessions and the response
	 */
	updateParticipants(
		boardId: string,
		updateReq: BoardSessionsUpdateRequest,
		cookieJar?: http.CookieJar,
	): [BoardSession[], http.Response] {
		const response = this.put(`./boards/${boardId}/participants`, updateReq, [], cookieJar);
		if (response.error_code) {
			return [[], response];
		}

		const sessions: BoardSession[] = response.json() as unknown as BoardSession[];
		return [sessions, response];
	}

	/**
	 * Update a session on aboard
	 *
	 * This calls `PUT /boards/{id}/participants/{id}`
	 * @param boardId id of the board
	 * @param userId id of the user
	 * @param updateReq session update values
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the updated session and the response
	 */
	updateParticipant(
		boardId: string,
		userId: string,
		updateReq: BoardSessionUpdateRequest,
		cookieJar?: http.CookieJar,
	): [BoardSession | null, http.Response] {
		const response = this.put(`./boards/${boardId}/participants/${userId}`, updateReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const session: BoardSession = response.json() as unknown as BoardSession;
		return [session, response];
	}

	/**
	 * Delete a session on aboard
	 *
	 * This calls `DELETE /boards/{id}/participants/{id}`
	 * @param boardId id of the board
	 * @param userId id of the user
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the response
	 */
	deleteParticipant(boardId: string, userId: string, cookieJar?: http.CookieJar): http.Response {
		const response = this.del(`./boards/${boardId}/participants/${userId}`, null, [], cookieJar);
		return response;
	}
}
