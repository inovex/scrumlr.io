import { BaseClient } from "../baseClient.ts";
import http from "k6/http";

export class HealthClient extends BaseClient {
  getHealth(cookieJar?: http.CookieJar): http.Response {
    const response = this.get("/health", [], cookieJar);
    return response
  }
}


