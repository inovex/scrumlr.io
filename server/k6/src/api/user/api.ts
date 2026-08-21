import { BaseClient } from "../baseClient.ts";
import http from "k6/http";
import { UpdateUserRequest } from "./requests.ts";
import {User} from "../../types/users.ts"

export class UserClient extends BaseClient {
  getCurrentUser(cookieJar?: http.CookieJar): [User | null, http.Response] {
    const response = this.get("/users", [], cookieJar);
    if (response.error_code) {
      return [null, response]
    }

    const user: User = response.json() as unknown as User
    return [user, response]
  }

  updateUser(update: UpdateUserRequest, cookieJar?: http.CookieJar): [User | null, http.Response] {
    const response = this.put("/users", update, [], cookieJar);
    if (response.error_code) {
      return [null, response]
    }

    const user: User = response.json() as unknown as User
    return [user, response]
  }

  getUserById(userId: string, cookieJar?: http.CookieJar): [User | null, http.Response] {
    const response = this.get(`/users/${userId}`, [], cookieJar);
    if (response.error_code) {
      return [null, response]
    }

    const user: User = response.json() as unknown as User
    return [user, response]
  }

  deleteUser(userId: string, cookieJar?: http.CookieJar): http.Response {
    const response = this.del(`/users/${userId}`, null, [], cookieJar);
    return response
  }
}


