import type http from "k6/http";
import { BaseClient } from "../baseClient.ts";

export class HealthClient extends BaseClient {
	getHealth(cookieJar?: http.CookieJar): http.Response {
		const response = this.get("./health", [], cookieJar);
		return response;
	}
}
