import {Template, TemplateWithColumns} from "store/features";
import {buildUrl} from "./index";

export const TemplatesAPI = {
  /**
   * Get all templates
   *
   * @returns all templates
   */
  getTemplates: async (): Promise<TemplateWithColumns[]> => {
    try {
      const url = buildUrl(`./templates`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return ((await response.json()) as TemplateWithColumns[]) ?? [];
      }

      throw new Error(`get all templates request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get all templates`, {cause: error});
    }
  },

  /**
   * Get a board template
   *
   * @param id id of a template
   *
   * @returns requested template
   */
  getTemplate: async (id: string): Promise<Template> => {
    try {
      const url = buildUrl(`./templates/${id}`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as Template;
      }

      throw new Error(`get template request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get all templates`, {cause: error});
    }
  },

  /**
   * Create a new board template
   *
   * @param templateWithColumns template to create
   *
   * @returns created template
   */
  createTemplate: async (templateWithColumns: TemplateWithColumns): Promise<Template> => {
    // strip UUIDs as they'll get assigned by the backend
    const {id: _templateId, creator: _creator, ...strippedTemplate} = templateWithColumns.template;
    const strippedColumnTemplates = templateWithColumns.columns.map(({id: _columnId, template: _template, ...columnRest}) => columnRest);

    try {
      const url = buildUrl(`./templates`);
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          ...strippedTemplate,
          // some naming inconsistencies here ...
          columnTemplates: strippedColumnTemplates,
        }),
      });

      if (response.status === 201) {
        return (await response.json()) as Template;
      }

      throw new Error(`create template request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to create template`, {cause: error});
    }
  },

  /**
   * Update the board template
   *
   * @param templateId template id
   * @param overwrite updated template
   *
   * @returns updated template
   */
  editTemplate: async (templateId: string, overwrite: Partial<Template>): Promise<Template> => {
    try {
      const url = buildUrl(`./templates/${templateId}`);
      const response = await fetch(url, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(overwrite),
      });

      if (response.status === 200) {
        return (await response.json()) as Template;
      }

      throw new Error(`edit template request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to edit template`, {cause: error});
    }
  },

  /**
   * Delete a board template
   *
   * @param templateId template id
   */
  deleteTemplate: async (templateId: string) => {
    try {
      const url = buildUrl(`./templates/${templateId}`);
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 204) {
        return;
      }

      throw new Error(`delete template request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to delete template`, {cause: error});
    }
  },
};
