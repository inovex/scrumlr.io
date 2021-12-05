import {mocked} from "ts-jest/utils";
import {callAPI} from "api/callApi";
import {getBrowserServerTimeDifference} from "../timer";

jest.mock("api/callApi");

const mockedCallApi = mocked(callAPI);

describe("Timer", () => {
  test("getBrowserServerTimeDifference", async () => {
    mockedCallApi.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolve(new Date(1234).toUTCString());
        })
    );
    const value = await getBrowserServerTimeDifference();

    expect(value).toBe(Date.parse(new Date().toUTCString()) - Date.parse(new Date(1234).toUTCString()));
  });
});
