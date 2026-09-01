import type http from "k6/http";
import { BaseClient } from "../baseClient.ts";
import type { CreateFeedbackRequest } from "./requests.ts";

export class FeedbackClient extends BaseClient {
	sendFeedback(feedbackReq: CreateFeedbackRequest, cookieJar?: http.CookieJar): http.Response {
		const response = this.post("./feedback", feedbackReq, [], cookieJar);
		return response;
	}
}
