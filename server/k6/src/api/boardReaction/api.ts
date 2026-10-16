import type http from "k6/http";
import { BaseClient } from "../baseClient.ts";
import type { CreateBoardReactionRequest } from "./requests.ts";

export class BoardReactionClient extends BaseClient {
	/**
	 * Create a board reaction
	 *
	 * This calls `POST /boards/{id}/board-reactions`
	 * @param boardId id of the board
	 * @param reaction reaction to create
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the response
	 */
	createBoardReaction(
		boardId: string,
		reaction: CreateBoardReactionRequest,
		cookieJar?: http.CookieJar,
	): http.Response {
		const response = this.post(`./boards/${boardId}/board-reactions`, reaction, [], cookieJar);
		return response;
	}
}
