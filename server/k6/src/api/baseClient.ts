import { URL } from "https://jslib.k6.io/url/1.0.0/index.js";
import http from "k6/http";
import { BASE_URL } from "../options.ts";

export interface QueryParameter {
	key: string;
	value: string | number | boolean | string[] | number[] | null | undefined;
}

export class BaseClient {
	get(
		path: string,
		queryParameter: QueryParameter[] = [],
		cookieJar?: http.CookieJar,
		extraHeaders?: Record<string, string>,
	): http.Response {
		const url = this.buildUrl(path, queryParameter);
		const headers = this.buildHeaders(cookieJar, extraHeaders);

    console.debug("get request: ", url.toString())

		return http.get(url.toString(), headers);
	}

	post(
		path: string,
		body?: any,
		queryParameter: QueryParameter[] = [],
		cookieJar?: http.CookieJar,
		extraHeaders?: Record<string, string>,
	): http.Response {
		const url = this.buildUrl(path, queryParameter);

		const payload = this.buildPayload(body);
		const headers = this.buildHeaders(cookieJar, extraHeaders);

    console.debug("post request: ", url.toString())

		return http.post(url.toString(), payload, headers);
	}

	put(
		path: string,
		body?: any,
		queryParameter: QueryParameter[] = [],
		cookieJar?: http.CookieJar,
		extraHeaders?: Record<string, string>,
	): http.Response {
		const url = this.buildUrl(path, queryParameter);
		const payload = this.buildPayload(body);
		const headers = this.buildHeaders(cookieJar, extraHeaders);

    console.debug("put request: ", url.toString())

		return http.put(url.toString(), payload, headers);
	}

	patch(
		path: string,
		body?: any,
		queryParameter: QueryParameter[] = [],
		cookieJar?: http.CookieJar,
		extraHeaders?: Record<string, string>,
	) {
		const url = this.buildUrl(path, queryParameter);
		const payload = this.buildPayload(body);
		const headers = this.buildHeaders(cookieJar, extraHeaders);

    console.debug("patch request: ", url.toString())

		return http.patch(url.toString(), payload, headers);
	}

	del(
		path: string,
		body?: any,
		queryParameter: QueryParameter[] = [],
		cookieJar?: http.CookieJar,
		extraHeaders?: Record<string, string>,
	): http.Response {
		const url = this.buildUrl(path, queryParameter);
		const payload = this.buildPayload(body);
		const headers = this.buildHeaders(cookieJar, extraHeaders);

    console.debug("delete request: ", url.toString())

		return http.del(url.toString(), payload, headers);
	}

	private buildUrl(path: string, queryParameter: QueryParameter[] = []): URL {
		const baseUrl = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
		const url = new URL(path, baseUrl);

		for (const param of queryParameter) {
			if (param.value !== null && param.value !== undefined) {
				if (Array.isArray(param.value)) {
					param.value.forEach((item) => {
						if (item !== null && item !== undefined) {
							url.searchParams.append(param.key, String(item));
						}
					});
				} else {
					url.searchParams.append(param.key, String(param.value));
				}
			}
		}

		return url;
	}

	private buildHeaders(cookieJar?: http.CookieJar, extraHeaders?: Record<string, string>): http.Params {
		let headers: Record<string, string> = {};

		if (extraHeaders !== undefined && extraHeaders !== null) {
			headers = { ...headers, ...extraHeaders };
		}

		if (!Object.hasOwn(headers, "Content-Type")) {
			headers["Content-Type"] = "application/json";
		}

		const params: http.Params = { headers };
		if (cookieJar !== undefined && cookieJar !== null) {
			params.jar = cookieJar;
		}

		return params;
	}

	private buildPayload(body: any): http.RequestBody | null {
		if (body !== undefined && body !== null) {
			if (typeof body === "string") {
				return body;
			}

			return JSON.stringify(body);
		}

		return null;
	}
}
