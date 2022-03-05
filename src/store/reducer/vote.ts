import {VotesState} from "types/vote";
import {ReduxAction} from "store/action";

// eslint-disable-next-line default-param-last
export const voteReducer = (state: VotesState = [], action: ReduxAction): VotesState => state;
