import {Template, TemplateDto} from "store/features";
import {SERVER_HTTP_URL} from "config";

export const TemplatesAPI = {
  getTemplates: async () => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/templates`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as TemplateDto[];
      }

      throw new Error(`get all templates request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get all templates with error: ${error}`);
    }
  },

  editTemplate: async (templateId: string, overwrite: Partial<Template>) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/templates/${templateId}`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(overwrite),
      });

      if (response.status === 200) {
        return (await response.json()) as Omit<Template, "columns">;
      }

      throw new Error(`get all templates request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get all templates with error: ${error}`);
    }
  },
};
