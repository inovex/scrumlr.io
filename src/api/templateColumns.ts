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
      throw new Error(`unable to get all templates columns with error: ${error}`);
    }
  },

  createTemplateColumn: async (templateId: string, templateColumn: TemplateColumn) => {
    const {id, ...templateColumnWithoutId} = templateColumn;
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/templates/${templateId}/columns`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(templateColumnWithoutId),
      });

      if (response.status === 201) {
        return (await response.json()) as TemplateColumn;
      }

      throw new Error(`add template column request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to add template column with error: ${error}`);
    }
  },

  editTemplateColumn: async (templateId: string, columnId: string, overwrite: Partial<TemplateColumn>) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/templates/${templateId}/columns/${columnId}`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(overwrite),
      });

      if (response.status === 200) {
        return (await response.json()) as TemplateColumn;
      }

      throw new Error(`edit template column request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to edit template column with error: ${error}`);
    }
  },

  deleteTemplateColumn: async (templateId: string, columnId: string) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/templates/${templateId}/columns/${columnId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 204) {
        return columnId;
      }

      throw new Error(`delete template column request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to delete template column with error: ${error}`);
    }
  },
};
