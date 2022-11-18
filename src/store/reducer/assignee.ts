import {ReduxAction} from "store/action";
import {AssigneeState} from "types/assignee";

export const assigneeReducer = (state: AssigneeState, action: ReduxAction): AssigneeState => ({name: "sample name", note: "note"});
