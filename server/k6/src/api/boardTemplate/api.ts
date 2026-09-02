import type http from "k6/http";
import type { BoardTemplate, BoardTemplateFull } from "../../types/boardTemplate.ts";
import { BaseClient } from "../baseClient.ts";
import type { CreateBoardTemplateRequest, UpdateBoardTemplateRequest } from "./requests.ts";

export class BoardTemplateClient extends BaseClient {
	createBoardTemplate(
		templateReq: CreateBoardTemplateRequest,
		cookieJar?: http.CookieJar,
	): [BoardTemplate | null, http.Response] {
		const response = this.post("./templates", templateReq, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const templates: BoardTemplate = response.json() as unknown as BoardTemplate;
		return [templates, response];
	}

	getBoardTemplates(cookieJar?: http.CookieJar): [BoardTemplateFull[], http.Response] {
		const response = this.get("./templates", [], cookieJar);
		if (response.error_code) {
			return [[], response];
		}

		const templates: BoardTemplateFull[] = response.json() as unknown as BoardTemplateFull[];
		return [templates, response];
	}

	getBoardTemplate(templateId: string, cookieJar?: http.CookieJar): [BoardTemplate | null, http.Response] {
		const response = this.get(`./templates/${templateId}`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const templates: BoardTemplate = response.json() as unknown as BoardTemplate;
		return [templates, response];
	}

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

	deleteBoardTemplate(templateId: string, cookieJar?: http.CookieJar): http.Response {
		const response = this.del(`./templates/${templateId}`, null, [], cookieJar);
		return response;
	}
}
