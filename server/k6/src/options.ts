import type { Options } from "k6/options";

/**
 * The base url for the k6 load tests.
 *
 * To set the base url use the env variable `BASEURL`.
 *
 * If not set defaults to `http://localhost:8080`
 */
export const BASE_URL = __ENV.BASEURL || "http://localhost:8080";

const baseOptions: Options = {
	blockHostnames: ["scrumlr.io"],
	userAgent: "scrumlrLoadTests",
	insecureSkipTLSVerify: true,
};

/**
 * Define options for the k6 e2e tests.
 */
const E2ETestOptions: Options = {
	...baseOptions,
	vus: 1,
	iterations: 1,
	thresholds: {
		checks: ["rate==1.0"],
	},
};

/**
 * Define options for the k6 load tests.
 */
const LoadTestOptions: Options = {
	...baseOptions,
	scenarios: {
		isolated: {
			executor: "ramping-vus",
			startVUs: 1,
			stages: [
				{ duration: "30s", target: 15 },
				{ duration: "60s", target: 30 },
				{ duration: "30s", target: 45 },
				{ duration: "30s", target: 0 },
			],
			exec: "isolated",
		},
		collaborative: {
			executor: "ramping-vus",
			startVUs: 1,
			startTime: "150s",
			stages: [
				{ duration: "30s", target: 15 },
				{ duration: "60s", target: 30 },
				{ duration: "30s", target: 45 },
				{ duration: "30s", target: 0 },
			],
			exec: "collaborative",
		},
	},
};

/**
 * Define options for the k6 stress tests.
 */
const StressTestOptions: Options = {
	...baseOptions,
	scenarios: {
		isolated: {
			executor: "ramping-vus",
			startVUs: 1,
			stages: [
				{ duration: "20s", target: 50 },
				{ duration: "60s", target: 150 },
				{ duration: "20s", target: 300 },
				{ duration: "20s", target: 0 },
			],
			exec: "isolated",
		},
		collaborative: {
			executor: "ramping-vus",
			startVUs: 1,
			startTime: "120s",
			stages: [
				{ duration: "20s", target: 50 },
				{ duration: "60s", target: 150 },
				{ duration: "20s", target: 300 },
				{ duration: "20s", target: 0 },
			],
			exec: "collaborative",
		},
	},
};

export let options: Options | undefined = undefined
switch(__ENV.TEST_TYPE) {
  case "e2e":
    options = E2ETestOptions;
    break;
  case "load":
    options = LoadTestOptions;
    break;
  case "stress":
    options = StressTestOptions;
    break;
  default:
    throw new Error("invalid test type")
}
