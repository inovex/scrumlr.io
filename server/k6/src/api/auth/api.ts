import { BaseClient } from "../baseClient.ts";
import http from "k6/http";
import { AnonymousSignUpRequest } from "./requests.ts";
import { User } from "../../types/users.ts"

export class AuthClient extends BaseClient {
  loginAnonymous(request: AnonymousSignUpRequest, cookieJar?: http.CookieJar): [User | null, http.Response] {
    const response: http.Response = this.post("/login/anonymous", request, [], cookieJar);
    if (response.error_code) {
      return [null, response]
    }

    const user: User = response.json() as unknown as User;
    return [user, response]
  }

  logout(cookieJar?: http.CookieJar): http.Response {
    const response: http.Response = this.del("/login", null, [], cookieJar);
    return response
  }
}


