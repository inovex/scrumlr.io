import Parse from "parse";
import {BoardAPI} from "./board";
import {NoteAPI} from "./note";
import {ColumnAPI} from "./column";
import {AuthAPI} from "./auth";

/**
 * Helper function for calls on the cloud functions of the Parse server backend.
 *
 * @param endpoint the name of the endpoint
 * @param request the request parameters
 *
 * @returns the asynchronous server response wrapped in a `Promise`
 */
export const callAPI = <RequestType, ResponseType>(endpoint: string, request: RequestType) => {
    return Parse.Cloud.run(endpoint, request) as Promise<ResponseType>;
}

/** This class lists all API functions of the server. */
export const API = {
    ...BoardAPI,
    ...ColumnAPI,
    ...NoteAPI,
    ...AuthAPI
}