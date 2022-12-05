import {Action, ReduxAction} from "store/action";
import {AssignState} from "types/assign";

export const assignReducer = (state: AssignState = [], action: ReduxAction): AssignState => {
  if (action.type === Action.InitializeBoard) {
    return action.assignings;
  }

  if (action.type === Action.AddAssignee) {
    return [{note: action.note, name: action.name, id: action.id}, ...state];
  }

  if (action.type === Action.RemoveAssignee) {
    const newAssignees = state.slice();
    const index = newAssignees.findIndex((a) => (a.id ? a.id === action.id : a.name === action.name));
    if (index >= 0) {
      newAssignees.splice(index, 1);
      return newAssignees;
    }
  }

  return state;
};
