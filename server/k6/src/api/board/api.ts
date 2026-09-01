import type http from "k6/http";
import type { Board, BoardOverview } from "../../types/board.ts";
import type { User } from "../../types/users.ts";
import { BaseClient } from "../baseClient.ts";
import type { CreateBoardRequest, JoinBoardRequest, SetTimerRequest, UpdateBoardRequest } from "./requests.ts";

export class BoardClient extends BaseClient {
	createBoard(boardReq: CreateBoardRequest, cookieJar?: http.CookieJar): [Board | null, http.Response] {
		const response = this.post("./boards", boardReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const board: Board = response.json() as unknown as Board;
		return [board, response];
	}

	getBoards(cookieJar?: http.CookieJar): [BoardOverview[] | null, http.Response] {
		const response = this.get("./boards", [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const boards: BoardOverview[] = response.json() as unknown as BoardOverview[];
		return [boards, response];
	}

	getBoard(boardId: string, cookieJar?: http.CookieJar): [Board | null, http.Response] {
		const response = this.get(`./boards/${boardId}`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const board: Board = response.json() as unknown as Board;
		return [board, response];
	}

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

	deleteBoard(boardId: string, cookieJar?: http.CookieJar): http.Response {
		const response = this.del(`./boards/${boardId}`, null, [], cookieJar);
		return response;
	}

	exportBoard(boardId: string, cookieJar?: http.CookieJar, extraHeaders?: Record<string, string>): http.Response {
		const response = this.get(`./boards/${boardId}/export`, [], cookieJar, extraHeaders);
		return response;
	}

	setTimer(boardId: string, timerReq: SetTimerRequest, cookieJar?: http.CookieJar): [Board | null, http.Response] {
		const response = this.post(`./boards/${boardId}/timer`, timerReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const board: Board = response.json() as unknown as Board;
		return [board, response];
	}

	incrementTimer(boardId: string, cookieJar?: http.CookieJar): [Board | null, http.Response] {
		const response = this.post(`./boards/${boardId}/timer/increment`, null, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const board: Board = response.json() as unknown as Board;
		return [board, response];
	}

	deleteTimer(boardId: string, cookieJar?: http.CookieJar): [Board | null, http.Response] {
		const response = this.del(`./boards/${boardId}/timer`, null, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const board: Board = response.json() as unknown as Board;
		return [board, response];
	}

	joinBoard(boardId: string, joinReq: JoinBoardRequest = {}, cookieJar?: http.CookieJar): http.Response {
		const response = this.post(`./boards/${boardId}/participants`, joinReq, [], cookieJar);
		return response;
	}

	getBoardUsers(boardId: string, cookieJar?: http.CookieJar): [User[] | null, http.Response] {
		const response = this.get(`./users/board/${boardId}`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const users: User[] = response.json() as unknown as User[];
		return [users, response];
	}
}
