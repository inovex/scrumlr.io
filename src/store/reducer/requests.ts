import {RequestsState} from "types/request";
import {ReduxAction} from "../action";

// eslint-disable-next-line default-param-last
export const joinRequestReducer = (state: RequestsState = [], action: ReduxAction): RequestsState => state;
