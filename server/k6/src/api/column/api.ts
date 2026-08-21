import { BaseClient } from "../baseClient.ts";
import http from "k6/http";
import { CreateColumnRequest, UpdateColumnRequest } from "./requests.ts";
import { Column } from "../../types/column.ts"

export class ColumnClient extends BaseClient {
  createColumn(boardId: string, colReq: CreateColumnRequest, cookieJar?: http.CookieJar): [Column | null, http.Response] {
    const response = this.post(`/boards/${boardId}/columns`, colReq, [], cookieJar);
    if (response.error_code) {
      return [null, response]
    }

    const column: Column = response.json() as unknown as Column;
    return [column, response]
  }

  getColumns(boardId: string, cookieJar?: http.CookieJar): [Column[] | null, http.Response] {
    const response = this.get(`/boards/${boardId}/columns`, [], cookieJar);
    if (response.error_code) {
      return [null, response]
    }

    const columns: Column[] = response.json() as unknown as Column[];
    return [columns, response]
  }

  getColumn(boardId: string, columnId: string, cookieJar?: http.CookieJar): [Column | null, http.Response] {
    const response = this.get(`/boards/${boardId}/columns/${columnId}`, [], cookieJar);
    if (response.error_code) {
      return [null, response]
    }

    const column: Column = response.json() as unknown as Column;
    return [column, response]
  }

  updateColumn(boardId: string, columnId: string, updateReq: UpdateColumnRequest, cookieJar?: http.CookieJar): [Column | null, http.Response] {
    const response = this.put(`/boards/${boardId}/columns/${columnId}`, updateReq, [], cookieJar);
    if (response.error_code) {
      return [null, response]
    }

    const column: Column = response.json() as unknown as Column;
    return [column, response]
  }

  deleteColumn(boardId: string, columnId: string, cookieJar?: http.CookieJar): http.Response {
    const response = this.del(`/boards/${boardId}/columns/${columnId}`, null, [], cookieJar);
    return response
  }
}


