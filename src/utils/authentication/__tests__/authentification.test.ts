import {waitFor} from "@testing-library/react";
import {mocked} from "ts-jest/utils";
import {Attributes, User} from "parse";
import {AuthenticationManager} from "../AuthenticationManager";

jest.mock("parse");
jest.mock("api");

const mockedUser = mocked(User, true);

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
});
