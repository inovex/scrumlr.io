import type http from "k6/http";
import { BaseClient } from "../baseClient.ts";
import type { CreateFeedbackRequest } from "./requests.ts";

export class FeedbackClient extends BaseClient {
	/**
	 * Send feedback for scrumlr
	 *
	 * This calls `POST /feedback`
	 * @param feedback the feedback to send
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the response
	 */
	sendFeedback(feedback: CreateFeedbackRequest, cookieJar?: http.CookieJar): http.Response {
		const response = this.post("./feedback", feedback, [], cookieJar);
		return response;
	}
}
