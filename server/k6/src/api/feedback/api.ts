import { BaseClient } from "../baseClient.ts";
import http from "k6/http";
import { CreateFeedbackRequest } from "./requests.ts";

export class FeedbackClient extends BaseClient {
  sendFeedback(feedbackReq: CreateFeedbackRequest, cookieJar?: http.CookieJar): http.Response {
    const response = this.post("/feedback", feedbackReq, [], cookieJar);
    return response
  }
}


