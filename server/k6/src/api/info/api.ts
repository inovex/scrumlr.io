import type http from "k6/http";
import type { Info } from "../../types/info.ts";
import { BaseClient } from "../baseClient.ts";

export class InfoClient extends BaseClient {
	getInfo(cookieJar?: http.CookieJar): [Info | null, http.Response] {
		const response = this.get("/info", [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const info: Info = response.json() as unknown as Info;
		return [info, response];
	}
}
