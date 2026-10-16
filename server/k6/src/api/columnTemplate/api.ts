import type http from "k6/http";
import type { ColumnTemplate } from "../../types/columnTemplate.ts";
import { BaseClient } from "../baseClient.ts";
import type { ColumnTemplateRequest } from "./requests.ts";

export class ColumnTemplateClient extends BaseClient {
	/**
	 * Create a column template on a board template
	 *
	 * This calls `POST /templates/{id}/columns
	 * @param templateId id of the template
	 * @param columnReq column template to create
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the column template and the response
	 */
	createColumnTemplate(
		templateId: string,
		columnReq: ColumnTemplateRequest,
		cookieJar?: http.CookieJar,
	): [ColumnTemplate | null, http.Response] {
		const response = this.post(`./templates/${templateId}/columns`, columnReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const template: ColumnTemplate = response.json() as unknown as ColumnTemplate;
		return [template, response];
	}

	/**
	 * Get all column templates from a template
	 *
	 * This calls `GET /templates/{id}/columns`
	 * @param templateId id of the template
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the column templates and teh response
	 */
	getColumnTemplates(templateId: string, cookieJar?: http.CookieJar): [ColumnTemplate[] | null, http.Response] {
		const response = this.get(`./templates/${templateId}/columns`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const template: ColumnTemplate[] = response.json() as unknown as ColumnTemplate[];
		return [template, response];
	}

	/**
	 * Get a column template
	 *
	 * This calls `GET /templates/{id}/columns/{id}`
	 * @param templateId id of the board template
	 * @param columnId id of the column template
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the column template and the response
	 */
	getColumnTemplate(
		templateId: string,
		columnId: string,
		cookieJar?: http.CookieJar,
	): [ColumnTemplate | null, http.Response] {
		const response = this.get(`./templates/${templateId}/columns/${columnId}`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const template: ColumnTemplate = response.json() as unknown as ColumnTemplate;
		return [template, response];
	}

	/**
	 * Update a column template
	 *
	 * This calls `PUT /templates/{id}/columns/{id}
	 * @param templateId id of the board template
	 * @param columnId id of the column template
	 * @param updateReq update values
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the update column template and teh response
	 */
	updateColumnTemplate(
		templateId: string,
		columnId: string,
		updateReq: ColumnTemplateRequest,
		cookieJar?: http.CookieJar,
	): [ColumnTemplate | null, http.Response] {
		const response = this.put(`./templates/${templateId}/columns/${columnId}`, updateReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const template: ColumnTemplate = response.json() as unknown as ColumnTemplate;
		return [template, response];
	}

	/**
	 * Delete a column template
	 *
	 * This calls `DELETE /templates/{id}/columns/{id}`
	 * @param templateId id of the board template
	 * @param columnId id of the column template
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the response
	 */
	deleteColumnTemplate(templateId: string, columnId: string, cookieJar?: http.CookieJar): http.Response {
		const response = this.del(`./templates/${templateId}/columns/${columnId}`, null, [], cookieJar);
		return response;
	}
}
