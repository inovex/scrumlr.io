import {getInitials} from "./name";

describe("initials", () => {
  test("name without spaces", () => {
    expect(getInitials("andiKandi")).toEqual("an");
  });

  test("name with one space", () => {
    expect(getInitials("andi Kandi")).toEqual("aK");
  });

  test("name with multiple spaces", () => {
    expect(getInitials("andi Kandi Superstar")).toEqual("aK");
  });

  test("name with special characters", () => {
    expect(getInitials("Johann Böhler")).toEqual("JB");
  });
});
