import i18n from "i18n";
import {Toast} from "../utils/Toast";
import {buildUrl} from "./index";

export const FeedbackAPI = {
  /**
   * Send feedback to the scrumlr team
   *
   * @param type feedback type
   * @param text feedback text
   * @param contact contact of the user
   */
  sendFeedback: async (type: string, text: string, contact?: string) => {
    try {
      const url = buildUrl(`./feedback`);
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          type,
          text,
          contact,
        }),
      });

      if (response.ok) {
        Toast.success({title: i18n.t("Feedback.SubmitNotification")});
      }
    } catch (error) {
      throw new Error(`unable to send feedback`, {cause: error});
    }
  },
};
