import {vi} from "vitest";
import {buildUrl} from "../index";

// overrite the VITE_SERVER_HTTP_URL before the static methods are evaluted
vi.hoisted(() => {
  vi.stubEnv("VITE_SERVER_HTTP_URL", "http://localhost:8080");
});

describe("buildUrl", () => {
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("build url with and empty path", () => {
    const result = buildUrl(``);

    expect(result.toString()).toBe(`http://localhost:8080/`);
  });

  it("build url path", () => {
    const result = buildUrl(`/boards`);

    expect(result.toString()).toBe("http://localhost:8080/boards");
  });

  it("build url with and path parameter", () => {
    const boardId = "afc968ee-6349-477e-bb68-5491dd984df1";

    const result = buildUrl(`/boards/${boardId}`);

    expect(result.toString()).toBe(`http://localhost:8080/boards/${boardId}`);
  });

  it("build url with and string query parameter", () => {
    const queryParams = [{key: "owner", value: "stan"}];

    const result = buildUrl(`/boards`, queryParams);

    expect(result.toString()).toBe(`http://localhost:8080/boards?${queryParams[0].key}=${queryParams[0].value}`);
  });

  it("build url with and string array query parameter", () => {
    const queryParams = [{key: "owner", value: ["stan", "luke"]}];

    const result = buildUrl(`/boards`, queryParams);

    expect(result.toString()).toBe(`http://localhost:8080/boards?${queryParams[0].key}=${queryParams[0].value[0]}&${queryParams[0].key}=${queryParams[0].value[1]}`);
  });

  it("build url with number query parameter", () => {
    const queryParams = [{key: "limit", value: 3}];

    const result = buildUrl(`/boards`, queryParams);

    expect(result.toString()).toBe(`http://localhost:8080/boards?${queryParams[0].key}=${queryParams[0].value}`);
  });

  it("build url with number array query parameter", () => {
    const queryParams = [{key: "limit", value: [3, 5]}];

    const result = buildUrl(`/boards`, queryParams);

    expect(result.toString()).toBe(`http://localhost:8080/boards?${queryParams[0].key}=${queryParams[0].value[0]}&${queryParams[0].key}=${queryParams[0].value[1]}`);
  });

  it("build url with boolean query parameter", () => {
    const queryParams = [{key: "active", value: false}];

    const result = buildUrl(`/boards`, queryParams);

    expect(result.toString()).toBe(`http://localhost:8080/boards?${queryParams[0].key}=${queryParams[0].value}`);
  });

  it("build url with multiple query parameters", () => {
    const queryParams = [
      {key: "owner", value: "stan"},
      {key: "limit", value: 3},
      {key: "active", value: true},
    ];

    const result = buildUrl(`/boards`, queryParams);

    expect(result.toString()).toBe(
      `http://localhost:8080/boards?${queryParams[0].key}=${queryParams[0].value}&${queryParams[1].key}=${queryParams[1].value}&${queryParams[2].key}=${queryParams[2].value}`
    );
  });

  it("build url with multiple array query parameters", () => {
    const queryParams = [
      {key: "owner", value: ["stan", "luke"]},
      {key: "limit", value: [3, 5]},
    ];

    const result = buildUrl(`/boards`, queryParams);

    expect(result.toString()).toBe(
      `http://localhost:8080/boards?${queryParams[0].key}=${queryParams[0].value[0]}&${queryParams[0].key}=${queryParams[0].value[1]}&${queryParams[1].key}=${queryParams[1].value[0]}&${queryParams[1].key}=${queryParams[1].value[1]}`
    );
  });
});
