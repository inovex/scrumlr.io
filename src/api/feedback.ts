import {SERVER_HTTP_URL} from "../config";
import {Toast} from "../utils/Toast";

export const FeedbackAPI = {
  sendFeedback: async (type: string, text: string, contact?: string) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/feedback`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          type,
          text,
          contact,
        }),
      });
      if (response.ok) {
        Toast.success("Thank you for your feedback!");
      }
    } catch (error) {
      throw new Error(`unable to send feedback: ${error}`);
    }
  },
};
