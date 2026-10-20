import type http from "k6/http";
import type { BoardSessionRequest, RequestStatus } from "../../types/sessionRequest.ts";
import { BaseClient, type QueryParameter } from "../baseClient.ts";
import type { BoardSessionRequestUpdate } from "./requests.ts";

export class SessionRequestClient extends BaseClient {
	/**
	 * Get all session requests for a board
	 *
	 * This calls `GET /boards/{id}/requests`
	 * @param boardId id of the board
	 * @param status status of the request
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the session requests and the response
	 */
	getBoardSessionRequests(
		boardId: string,
		status: RequestStatus | null = null,
		cookieJar?: http.CookieJar,
	): [BoardSessionRequest[] | null, http.Response] {
		const queryparams: QueryParameter[] = [{ key: "status", value: status }];

		const response = this.get(`./boards/${boardId}/requests`, queryparams, cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const sessionRequest: BoardSessionRequest[] = response.json() as unknown as BoardSessionRequest[];
		return [sessionRequest, response];
	}

	/**
	 * Get a session request for a board
	 *
	 * This calls `GET /boards/{id}/requests{id}`
	 * @param boardId id of the board
	 * @param userId id of the user
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the session request and the response
	 */
	getBoardSessionRequest(
		boardId: string,
		userId: string,
		cookieJar?: http.CookieJar,
	): [BoardSessionRequest | null, http.Response] {
		const response = this.get(`./boards/${boardId}/requests/${userId}`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const sessionRequest: BoardSessionRequest = response.json() as unknown as BoardSessionRequest;
		return [sessionRequest, response];
	}

	/**
	 * Update a session request on a board
	 *
	 * This calls `PUT /boards/{id}/requests/{id}
	 * @param boardId id of the board
	 * @param userId id of the user
	 * @param updateReq session request update values
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the updated request and the response
	 */
	updateBoardSessionRequest(
		boardId: string,
		userId: string,
		updateReq: BoardSessionRequestUpdate,
		cookieJar?: http.CookieJar,
	): [BoardSessionRequest | null, http.Response] {
		const response = this.put(`./boards/${boardId}/requests/${userId}`, updateReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const sessionRequest: BoardSessionRequest = response.json() as unknown as BoardSessionRequest;
		return [sessionRequest, response];
	}
}
