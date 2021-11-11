import {waitFor} from "@testing-library/react";
import {mocked} from "ts-jest/utils";
import {Attributes, User} from "parse";
import {API} from "api";
import {AuthenticationManager} from "../AuthenticationManager";

jest.mock("parse");
jest.mock("api");

const mockedUser = mocked(User, true);
const mockedSignIn = mocked(API.signIn);

describe("AuthenticationManager", () => {
  test("signInAnonymously", async () => {
    const user = {
      linkWith: jest.fn().mockReturnValue(Promise.resolve(true)),
      set: jest.fn(),
    };
    mockedUser.mockImplementation(() => user as unknown as User<Attributes>);

    const result = await AuthenticationManager.signInAnonymously("test", "url");

    waitFor(() => {
      expect(result).toEqual(true);
      expect(user.set).toBeCalledWith("displayName", "test");
      expect(user.set).toBeCalledWith("photoURL", "url");
    });
  });

  test("signInAnonymouslyWithError", async () => {
    const user = {
      linkWith: jest.fn().mockImplementation(() => {
        throw new Error("Something bad happened");
      }),
      set: jest.fn(),
    };
    mockedUser.mockImplementation(() => user as unknown as User<Attributes>);
    expect(await AuthenticationManager.signInAnonymously("test", "url")).toBeNull();
  });

  test("signInWithAuthProvider", async () => {
    const url = "http://localhost/";
    mockedSignIn.mockImplementation((authProvider: string, originURL: string) => originURL);

    await AuthenticationManager.signInWithAuthProvider("test", url);

    await waitFor(() => {
      expect(mockedSignIn).toBeCalledTimes(1);
      expect(mockedSignIn).toBeCalledWith("test", url);
      expect(window.location.href).toEqual(url);
    });
  });
});
