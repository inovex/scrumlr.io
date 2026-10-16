import type http from "k6/http";
import type { Board, BoardOverview } from "../../types/board.ts";
import type { User } from "../../types/users.ts";
import { BaseClient } from "../baseClient.ts";
import type { CreateBoardRequest, JoinBoardRequest, SetTimerRequest, UpdateBoardRequest } from "./requests.ts";

export class BoardClient extends BaseClient {
	/**
	 * Create a new board
	 *
	 * This calls `POST /boards`
	 * @param boardReq the board to create
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the created board and the response
	 */
	createBoard(boardReq: CreateBoardRequest, cookieJar?: http.CookieJar): [Board | null, http.Response] {
		const response = this.post("./boards", boardReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const board: Board = response.json() as unknown as Board;
		return [board, response];
	}

	/**
	 * Get all boards of the user
	 *
	 * This calls `GET /boards`
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the boards and the response
	 */
	getBoards(cookieJar?: http.CookieJar): [BoardOverview[] | null, http.Response] {
		const response = this.get("./boards", [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const boards: BoardOverview[] = response.json() as unknown as BoardOverview[];
		return [boards, response];
	}

	/**
	 * Get a board by its id
	 *
	 * This calls `GET /boards/{id}`
	 * @param boardId the board id
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the requested board and the response
	 */
	getBoard(boardId: string, cookieJar?: http.CookieJar): [Board | null, http.Response] {
		const response = this.get(`./boards/${boardId}`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const board: Board = response.json() as unknown as Board;
		return [board, response];
	}

	/**
	 * Update a board
	 *
	 * This calls `PUT /boards/{id}`
	 * @param boardId id of the board to update
	 * @param updateReq update values
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the updated board and the response
	 */
	updateBoard(
		boardId: string,
		updateReq: UpdateBoardRequest,
		cookieJar?: http.CookieJar,
	): [Board | null, http.Response] {
		const response = this.put(`./boards/${boardId}`, updateReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const board: Board = response.json() as unknown as Board;
		return [board, response];
	}

	/**
	 * Delete a board
	 *
	 * This calls `DELETE /boards/{id}`
	 * @param boardId id of the board to delete
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the response
	 */
	deleteBoard(boardId: string, cookieJar?: http.CookieJar): http.Response {
		const response = this.del(`./boards/${boardId}`, null, [], cookieJar);
		return response;
	}

	/**
	 * Export a board
	 *
	 * This calls `GET /boards/{id}/export`
	 * @param boardId id of the board to export
	 * @param cookieJar cookie jar with the authentication token
	 * @param extraHeaders extra header for the export
	 * @returns the response
	 */
	exportBoard(boardId: string, cookieJar?: http.CookieJar, extraHeaders?: Record<string, string>): http.Response {
		const response = this.get(`./boards/${boardId}/export`, [], cookieJar, extraHeaders);
		return response;
	}

	/**
	 * Set a timer for a board
	 *
	 * This calls `POST /boards/{id}/timer`
	 * @param boardId id of the board
	 * @param timerReq timer to set
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the board and the response
	 */
	setTimer(boardId: string, timerReq: SetTimerRequest, cookieJar?: http.CookieJar): [Board | null, http.Response] {
		const response = this.post(`./boards/${boardId}/timer`, timerReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const board: Board = response.json() as unknown as Board;
		return [board, response];
	}

	/**
	 * Increment a timer by one minute
	 *
	 * This calls `POST /boards/{id}/timer/increment`
	 * @param boardId id of the board
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the board and the response
	 */
	incrementTimer(boardId: string, cookieJar?: http.CookieJar): [Board | null, http.Response] {
		const response = this.post(`./boards/${boardId}/timer/increment`, null, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const board: Board = response.json() as unknown as Board;
		return [board, response];
	}

	/**
	 * Delete a timer
	 *
	 * This calls `DELETE /boards/{id}/timer`
	 * @param boardId id of the board
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the board and the response
	 */
	deleteTimer(boardId: string, cookieJar?: http.CookieJar): [Board | null, http.Response] {
		const response = this.del(`./boards/${boardId}/timer`, null, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const board: Board = response.json() as unknown as Board;
		return [board, response];
	}

	/**
	 * Join a board
	 *
	 * This calls `POST /boards/{id}/participants`
	 * @param boardId id of the board
	 * @param joinReq join request
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the response
	 */
	joinBoard(boardId: string, joinReq: JoinBoardRequest = {}, cookieJar?: http.CookieJar): http.Response {
		const response = this.post(`./boards/${boardId}/participants`, joinReq, [], cookieJar);
		return response;
	}

	/**
	 * Get all users on a board
	 *
	 * This calls `GET /users/boards/{id}`
	 * @param boardId id of the board
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the users and the response
	 */
	getBoardUsers(boardId: string, cookieJar?: http.CookieJar): [User[] | null, http.Response] {
		const response = this.get(`./users/board/${boardId}`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const users: User[] = response.json() as unknown as User[];
		return [users, response];
	}
}
