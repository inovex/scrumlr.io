import {Template, TemplateWithColumns} from "store/features";
import {SERVER_HTTP_URL} from "config";

export const TemplatesAPI = {
  getTemplates: async () => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/templates`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as TemplateWithColumns[];
      }

      throw new Error(`get all templates request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get all templates with error: ${error}`);
    }
  },

  getTemplate: async (id: string) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/templates/${id}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as Template;
      }

      throw new Error(`get template request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get all templates with error: ${error}`);
    }
  },

  createTemplate: async (templateWithColumns: TemplateWithColumns) => {
    // strip UUIDs as they'll get assigned by the backend
    const {id, creator, ...templateRest} = templateWithColumns.template;
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/templates`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          ...templateRest,
          // some naming inconsistencies here ...
          columnTemplates: templateWithColumns.columns,
        }),
      });

      if (response.status === 201) {
        return (await response.json()) as Template;
      }

      throw new Error(`create template request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to create template with error: ${error}`);
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
        return (await response.json()) as Template;
      }

      throw new Error(`get all templates request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get all templates with error: ${error}`);
    }
  },
};
