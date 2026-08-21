import { BaseClient } from "../baseClient.ts";
import http from "k6/http"
import { CreateBoardReactionRequest } from "./requests.ts";

export class BoardReactionClient extends BaseClient {
  createBoardReaction(boardId: string, reactReq: CreateBoardReactionRequest, cookieJar?: http.CookieJar): http.Response {
    const response = this.post(`/boards/${boardId}/board-reactions`, reactReq, [], cookieJar);
    return response
  }
}


