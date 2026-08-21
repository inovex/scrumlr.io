import { BaseClient } from "../baseClient.ts";
import http from "k6/http";
import {Info} from "../../types/info.ts"

export class InfoClient extends BaseClient {
  getInfo(cookieJar?: http.CookieJar): [Info | null, http.Response] {
    const response = this.get("/info", [], cookieJar);
    if (response.error_code) {
      return [null, response]
    }

    const info: Info = response.json() as unknown as Info;
    return [info, response]
  }
}
