import { Options } from "k6/options";

/**
 * The base url for the k6 load tests.
 *
 * To set the base url use the env variable `BASEURL`.
 *
 * If not set defaults to `http://localhost:8080`
 */
export const BASE_URL = __ENV.BASEURL || "http://localhost:8080";

/**
 * Define options for the k6 load tests.
 */
export const options: Options = {
  blockHostnames: ["scrumlr.io"],
  userAgent: "scrumlrLoadTests",
  iterations: 10,
  vus: 10,
  duration: "30s",
  insecureSkipTLSVerify: true
};
