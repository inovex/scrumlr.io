import {SERVER_HTTP_URL} from "config";
import {TemplateColumn} from "store/features";

export const TemplateColumnsAPI = {
  getTemplateColumns: async (template: string) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/templates/${template}/columns`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as TemplateColumn[];
      }

      throw new Error(`get all template columns request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get all templates with error: ${error}`);
    }
  },
};
