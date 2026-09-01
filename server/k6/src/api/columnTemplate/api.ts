import type http from "k6/http";
import type { ColumnTemplate } from "../../types/columnTemplate.ts";
import { BaseClient } from "../baseClient.ts";
import type { ColumnTemplateRequest } from "./requests.ts";

export class ColumnTemplateClient extends BaseClient {
	createColumnTemplate(
		templateId: string,
		colReq: ColumnTemplateRequest,
		cookieJar?: http.CookieJar,
	): [ColumnTemplate | null, http.Response] {
		const response = this.post(`./templates/${templateId}/columns`, colReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const template: ColumnTemplate = response.json() as unknown as ColumnTemplate;
		return [template, response];
	}

	getColumnTemplates(templateId: string, cookieJar?: http.CookieJar): [ColumnTemplate[] | null, http.Response] {
		const response = this.get(`./templates/${templateId}/columns`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const template: ColumnTemplate[] = response.json() as unknown as ColumnTemplate[];
		return [template, response];
	}

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

	deleteColumnTemplate(templateId: string, columnId: string, cookieJar?: http.CookieJar): http.Response {
		const response = this.del(`./templates/${templateId}/columns/${columnId}`, null, [], cookieJar);
		return response;
	}
}
