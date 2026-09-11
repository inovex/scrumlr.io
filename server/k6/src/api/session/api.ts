import type http from "k6/http";
import type { Role } from "../../types/roles.ts";
import type { BoardSession } from "../../types/session.ts";
import { BaseClient, type QueryParameter } from "../baseClient.ts";
import type { BoardSessionsUpdateRequest, BoardSessionUpdateRequest } from "./requests.ts";

export class SessionClient extends BaseClient {
	getParticipants(
		boardId: string,
		connected: boolean | null = null,
		ready: boolean | null = null,
		raisedHand: boolean | null = null,
		role: Role | null = null,
		cookieJar?: http.CookieJar,
	): [BoardSession[] | null, http.Response] {
		const queryparams: QueryParameter[] = [
			{ key: "connected", value: connected },
			{ key: "ready", value: ready },
			{ key: "raisedHand", value: raisedHand },
			{ key: "role", value: role },
		];

		const response = this.get(`./boards/${boardId}/participants`, queryparams, cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const sessions: BoardSession[] = response.json() as unknown as BoardSession[];
		return [sessions, response];
	}

	getParticipant(boardId: string, sessionId: string, cookieJar?: http.CookieJar): [BoardSession | null, http.Response] {
		const response = this.get(`./boards/${boardId}/participants/${sessionId}`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const session: BoardSession = response.json() as unknown as BoardSession;
		return [session, response];
	}

	updateParticipants(
		boardId: string,
		updateReq: BoardSessionsUpdateRequest,
		cookieJar?: http.CookieJar,
	): [BoardSession[] | null, http.Response] {
		const response = this.put(`./boards/${boardId}/participants`, updateReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const sessions: BoardSession[] = response.json() as unknown as BoardSession[];
		return [sessions, response];
	}

	updateParticipant(
		boardId: string,
		sessionId: string,
		updateReq: BoardSessionUpdateRequest,
		cookieJar?: http.CookieJar,
	): [BoardSession | null, http.Response] {
		const response = this.put(`./boards/${boardId}/participants/${sessionId}`, updateReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const session: BoardSession = response.json() as unknown as BoardSession;
		return [session, response];
	}

	deleteParticipant(boardId: string, sessionId: string, cookieJar?: http.CookieJar): http.Response {
		const response = this.del(`./boards/${boardId}/participants/${sessionId}`, null, [], cookieJar);
		return response;
	}
}
