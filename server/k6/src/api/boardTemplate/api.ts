import type http from "k6/http";
import type { BoardTemplate, BoardTemplateFull } from "../../types/boardTemplate.ts";
import { BaseClient } from "../baseClient.ts";
import type { CreateBoardTemplateRequest, UpdateBoardTemplateRequest } from "./requests.ts";

export class BoardTemplateClient extends BaseClient {
	/**
	 * Create a new board template
	 *
	 * This calls `POST /templates`
	 * @param templateReq the template to create
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the created template and the response
	 */
	createBoardTemplate(
		templateReq: CreateBoardTemplateRequest,
		cookieJar?: http.CookieJar,
	): [BoardTemplate | null, http.Response] {
		const response = this.post("./templates", templateReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const template: BoardTemplate = response.json() as unknown as BoardTemplate;
		return [template, response];
	}

	/**
	 * Get all board templates from the current user
	 *
	 * This calls `GET /templates`
	 * @param cookieJar cookie jar with the authentication token
	 * @returns tempaltes and the response
	 */
	getBoardTemplates(cookieJar?: http.CookieJar): [BoardTemplateFull[] | null, http.Response] {
		const response = this.get("./templates", [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const templates: BoardTemplateFull[] = response.json() as unknown as BoardTemplateFull[];
		return [templates, response];
	}

	/**
	 * Get a board template by its id
	 *
	 * This calls `GET /templates/{id}`
	 * @param templateId id of the template
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the template and the response
	 */
	getBoardTemplate(templateId: string, cookieJar?: http.CookieJar): [BoardTemplate | null, http.Response] {
		const response = this.get(`./templates/${templateId}`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const templates: BoardTemplate = response.json() as unknown as BoardTemplate;
		return [templates, response];
	}

	/**
	 * Update a board template
	 *
	 * This calls `PUT /templates/{id}`
	 * @param templateId id of the template
	 * @param updateReq update values
	 * @param cookieJar cookie jar with the authentication token
	 * @returns updated template and the response
	 */
	updateBoardTemplate(
		templateId: string,
		updateReq: UpdateBoardTemplateRequest,
		cookieJar?: http.CookieJar,
	): [BoardTemplate | null, http.Response] {
		const response = this.put(`./templates/${templateId}`, updateReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const templates: BoardTemplate = response.json() as unknown as BoardTemplate;
		return [templates, response];
	}

	/**
	 * Delete a template
	 *
	 * This calls `DELETE /templates/{id}`
	 * @param templateId id of the template
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the response
	 */
	deleteBoardTemplate(templateId: string, cookieJar?: http.CookieJar): http.Response {
		const response = this.del(`./templates/${templateId}`, null, [], cookieJar);
		return response;
	}
}
