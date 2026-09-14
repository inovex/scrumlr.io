import {generateRandomString} from "utils/random";

describe(`generaterandomstring`, () => {
  it(`generate a random string with default length`, () => {
    const randomString = generateRandomString();

    expect(randomString).length(8);
  });

  it(`generates a random string of given length`, () => {
    const length = 10;
    const randomString = generateRandomString(length);

    expect(randomString).length(length);
  });
});
