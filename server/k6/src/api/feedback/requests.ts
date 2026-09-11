import type { Feedback } from "../../types/feedback.ts";

export interface CreateFeedbackRequest {
	text: string;
	type: Feedback;
	contact?: string;
}
