import {Action, ReduxAction} from "store/action";
import {AssignmentsState} from "types/assignment";

// eslint-disable-next-line @typescript-eslint/default-param-last
export const assignmentReducer = (state: AssignmentsState = [], action: ReduxAction): AssignmentsState => {
  switch (action.type) {
    case Action.InitializeBoard:
      return action.assignments;
    case Action.CreatedAssignment:
      return [...state, action.assignment];
    case Action.DeletedAssignment:
      return state.filter((a) => a.id !== action.assignmentId);
    default:
      return state;
  }
};
