import type http from "k6/http";
import type { User } from "../../types/users.ts";
import { BaseClient } from "../baseClient.ts";
import type { UpdateUserRequest } from "./requests.ts";

export class UserClient extends BaseClient {
	/**
	 * Get the current logged in user
	 *
	 * This calls `GET /users`
	 * @param cookieJar cookie jar with the authentication token
	 * @returns The user and the response
	 */
	getCurrentUser(cookieJar?: http.CookieJar): [User | null, http.Response] {
		const response = this.get("./users", [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const user: User = response.json() as unknown as User;
		return [user, response];
	}

	/**
	 * Update the current logged in user
	 *
	 * This calls `PUT /users`
	 * @param update The update request
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the updated user and the response
	 */
	updateUser(update: UpdateUserRequest, cookieJar?: http.CookieJar): [User | null, http.Response] {
		const response = this.put("./users", update, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const user: User = response.json() as unknown as User;
		return [user, response];
	}

	/**
	 * Get a user by its id
	 *
	 * This calls `GET /users/{id}`
	 * @param userId The id of the user to request
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the requested user and the response
	 */
	getUserById(userId: string, cookieJar?: http.CookieJar): [User | null, http.Response] {
		const response = this.get(`./users/${userId}`, [], cookieJar);
		if (response.error_code) {
			return [null, response];
		}

		const user: User = response.json() as unknown as User;
		return [user, response];
	}

	/**
	 * Delete a user by its id
	 *
	 * This calls `DELETE /users/{id}`
	 * @param userId The id of the user to delete
	 * @param cookieJar cookie jar with the authentication token
	 * @returns the response
	 */
	deleteUser(userId: string, cookieJar?: http.CookieJar): http.Response {
		const response = this.del(`./users/${userId}`, null, [], cookieJar);
		return response;
	}
}
