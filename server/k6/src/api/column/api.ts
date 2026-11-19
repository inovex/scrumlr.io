import type http from "k6/http";
import type { Column } from "../../types/column.ts";
import { BaseClient } from "../baseClient.ts";
import type { CreateColumnRequest, UpdateColumnRequest } from "./requests.ts";

export class ColumnClient extends BaseClient {
	/**
	 * Create a column on a board
	 *
	 * This calls `POST /boards/{id}/columns`
	 * @param boardId id of the board
	 * @param columnReq column to create
	 * @param cookieJar cookie jar with the authentication token
	 * @returns created column and the response
	 */
	createColumn(
		boardId: string,
		columnReq: CreateColumnRequest,
		cookieJar?: http.CookieJar,
	): [Column | null, http.Response] {
		const response = this.post(`./boards/${boardId}/columns`, columnReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const column: Column = response.json() as unknown as Column;
		return [column, response];
	}

	/**
	 * Get all columns on a board
	 *
	 * This calls `GET /boards/{id}/columns`
	 * @param boardId id of the board
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the columns of the board and the response
	 */
	getColumns(boardId: string, cookieJar?: http.CookieJar): [Column[] | null, http.Response] {
		const response = this.get(`./boards/${boardId}/columns`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const columns: Column[] = response.json() as unknown as Column[];
		return [columns, response];
	}

	/**
	 * Get a column from a board
	 *
	 * This calls `GET /boards/{id}/columns/{id}`
	 * @param boardId id of the board
	 * @param columnId id of the column
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the column and the response
	 */
	getColumn(boardId: string, columnId: string, cookieJar?: http.CookieJar): [Column | null, http.Response] {
		const response = this.get(`./boards/${boardId}/columns/${columnId}`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const column: Column = response.json() as unknown as Column;
		return [column, response];
	}

	/**
	 * Update a column on a board
	 *
	 * This calls `PUT /boards/{id}/columns/{id}`
	 * @param boardId id of the board
	 * @param columnId id of the column
	 * @param updateReq updated values
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the updated column and the response
	 */
	updateColumn(
		boardId: string,
		columnId: string,
		updateReq: UpdateColumnRequest,
		cookieJar?: http.CookieJar,
	): [Column | null, http.Response] {
		const response = this.put(`./boards/${boardId}/columns/${columnId}`, updateReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const column: Column = response.json() as unknown as Column;
		return [column, response];
	}

	/**
	 * Delete a column on a board
	 *
	 * This calls `DELETE /boards/{id}/columns/{id}`
	 * @param boardId id of the board
	 * @param columnId id of the column
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the response
	 */
	deleteColumn(boardId: string, columnId: string, cookieJar?: http.CookieJar): http.Response {
		const response = this.del(`./boards/${boardId}/columns/${columnId}`, null, [], cookieJar);
		return response;
	}
}
