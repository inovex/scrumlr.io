import {AuthAPI} from "api/auth";
import {callAPI} from "api/callApi";

jest.mock("api/callApi");

describe("auth api", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test("redirect url not set leads to error", async () => {
    await expect(AuthAPI.verifySignIn("code", "state", "provider")).rejects.toThrow();
  });

  test("verification returns user", async () => {
    sessionStorage.setItem("state", "123");
    callAPI.mockResolvedValue({name: "John Doe"});

    const result = await AuthAPI.verifySignIn("code", "state", "provider");
    expect(result).toEqual({
      user: {
        name: "John Doe",
      },
      redirectURL: "123",
    });
  });

  test("verification returns correct state URL", async () => {
    sessionStorage.setItem("state", "456");
    callAPI.mockResolvedValue({name: "John Doe"});

    const result = await AuthAPI.verifySignIn("code", "state", "provider");
    expect(result.redirectURL).toEqual("456");
  });
});
