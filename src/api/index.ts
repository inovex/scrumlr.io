import Parse from "parse";
import {BoardAPI} from "./board";
import {NoteAPI} from "./note";
import {ColumnAPI} from "./column";

export const callAPI = <RequestType, ResponseType>(endpoint: string, request: RequestType) => {
    return Parse.Cloud.run(endpoint, request) as Promise<ResponseType>;
}

export const API = {
    ...BoardAPI,
    ...ColumnAPI,
    ...NoteAPI
}