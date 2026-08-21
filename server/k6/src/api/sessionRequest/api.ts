import { BaseClient, QueryParameter } from "../baseClient.ts";
import http from "k6/http";
import { BoardSessionRequestUpdate } from "./requests.ts";
import { BoardSessionRequest, RequestStatus } from "../../types/sessionRequest.ts";

export class SessionRequestClient extends BaseClient {
  getBoardSessionRequests(boardId: string, status: RequestStatus | null = null, cookieJar?: http.CookieJar): [BoardSessionRequest[] | null, http.Response] {
    const queryparams: QueryParameter[] = [
      {key: "status", value: status}
    ]

    const response = this.get(`/boards/${boardId}/requests`, queryparams, cookieJar);
    if (response.error_code) {
      return [null, response]
    }

    const sessionRequest: BoardSessionRequest[] = response.json() as unknown as BoardSessionRequest[]
    return [sessionRequest, response]
  }

  getBoardSessionRequest(boardId: string, userId: string, cookieJar?: http.CookieJar): [BoardSessionRequest | null, http.Response] {
    const response = this.get(`/boards/${boardId}/requests/${userId}`, [], cookieJar);
    if (response.error_code) {
      return [null, response]
    }

    const sessionRequest: BoardSessionRequest = response.json() as unknown as BoardSessionRequest
    return [sessionRequest, response]
  }

  updateBoardSessionRequest(boardId: string, userId: string, updateReq: BoardSessionRequestUpdate, cookieJar?: http.CookieJar): [BoardSessionRequest | null, http.Response] {
    const response = this.put(`/boards/${boardId}/requests/${userId}`, updateReq, [], cookieJar);
    if (response.error_code) {
      return [null, response]
    }

    const sessionRequest: BoardSessionRequest = response.json() as unknown as BoardSessionRequest
    return [sessionRequest, response]
  }
}

