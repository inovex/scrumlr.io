import Parse from "parse";

/**
 * Helper function for calls on the cloud functions of the Parse server backend.
 *
 * @param endpoint the name of the endpoint
 * @param request the request parameters
 *
 * @returns the asynchronous server response wrapped in a `Promise`
 */
export const callAPI = <RequestType, ResponseType>(endpoint: string, request: RequestType) => Parse.Cloud.run(endpoint, request) as Promise<ResponseType>;
