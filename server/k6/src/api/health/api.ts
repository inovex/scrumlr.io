import type http from "k6/http";
import { BaseClient } from "../baseClient.ts";

export class HealthClient extends BaseClient {
	/**
	 * Get the healt status of the server
	 *
	 * This calls `GET /health`
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the response
	 */
	getHealth(cookieJar?: http.CookieJar): http.Response {
		const response = this.get("./health", [], cookieJar);
		return response;
	}
}
