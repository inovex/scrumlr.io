import {TemplateColumn} from "store/features";
import {buildUrl} from "./index";

export const TemplateColumnsAPI = {
  /**
   * Get all template columns for a boad template
   *
   * @param templateId board template id
   *
   * @returns all template columns
   */
  getTemplateColumns: async (templateId: string): Promise<TemplateColumn[]> => {
    try {
      const url = buildUrl(`./templates/${templateId}/columns`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        return (await response.json()) as TemplateColumn[];
      }

      throw new Error(`get all template columns request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get all templates columns`, {cause: error});
    }
  },

  /**
   * Get a template columns for a boad template
   *
   * @param templateId board template id
   * @param templateColumnId column template id
   *
   * @returns all template columns
   */
  getTemplateColumn: async (templateId: string, templateColumnId: string): Promise<TemplateColumn> => {
    try {
      const url = buildUrl(`./templates/${templateId}/columns/${templateColumnId}`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as TemplateColumn;
      }

      throw new Error(`get a template columns request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get a templates columns`, {cause: error});
    }
  },

  /**
   * Create a new column template
   *
   * @param templateId board template id
   * @param templateColumn column template
   *
   * @returnscreated column template
   */
  createTemplateColumn: async (templateId: string, templateColumn: TemplateColumn): Promise<TemplateColumn> => {
    const {id: _id, ...templateColumnWithoutId} = templateColumn;

    try {
      const url = buildUrl(`./templates/${templateId}/columns`);
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(templateColumnWithoutId),
      });

      if (response.status === 201) {
        return (await response.json()) as TemplateColumn;
      }

      throw new Error(`add template column request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to add template column`, {cause: error});
    }
  },

  /**
   * Update a column template
   *
   * @param templateId board template id
   * @param columnId column template id
   * @param overwrite new column template values
   *
   * @returns updated column template
   */
  editTemplateColumn: async (templateId: string, columnId: string, overwrite: Partial<TemplateColumn>): Promise<TemplateColumn> => {
    try {
      const url = buildUrl(`./templates/${templateId}/columns/${columnId}`);
      const response = await fetch(url, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(overwrite),
      });

      if (response.status === 200) {
        return (await response.json()) as TemplateColumn;
      }

      throw new Error(`edit template column request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to edit template column`, {cause: error});
    }
  },

  /**
   * Delete a column template
   *
   * @param templateId board template id
   * @param columnId column template id
   */
  deleteTemplateColumn: async (templateId: string, columnId: string) => {
    try {
      const url = buildUrl(`./templates/${templateId}/columns/${columnId}`);
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 204) {
        return columnId;
      }

      throw new Error(`delete template column request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to delete template column`, {cause: error});
    }
  },
};
