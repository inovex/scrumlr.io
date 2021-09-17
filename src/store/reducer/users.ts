import {UsersState} from "types/store";
import {UserClientModel} from "types/user";
import {ActionType, ReduxAction} from "../action";

export const usersReducer = (state: UsersState = {admins: [], basic: [], all: []}, action: ReduxAction): UsersState => {
  switch (action.type) {
    case ActionType.SetUsers: {
      const newState = {
        admins: state.admins,
        basic: state.basic,
        all: [] as UserClientModel[],
      };

      if (action.admin) {
        newState.admins = action.users;
      } else {
        newState.basic = action.users;
      }

      newState.all = [...newState.admins];
      newState.basic.forEach((member) => {
        if (!newState.admins.find((admin) => admin.id === member.id)) {
          newState.all.push(member);
        }
      });
      return newState;
    }
    case ActionType.SetUserStatus: {
      const newState = {
        admins: state.admins,
        basic: state.basic,
        all: state.all,
      };

      const user = newState.all.find((member) => member.id === action.userId);
      if (user) {
        user.online = action.status;
      }

      return newState;
    }
    case ActionType.UpdateUser: {
      const newState = {
        admins: state.admins,
        basic: state.basic,
        all: state.all,
      };

      const user = newState.all.find((member) => member.id === action.user.objectId);
      if (user) {
        user.showHiddenColumns = action.user.showHiddenColumns;
      }
      return newState;
    }
    default: {
      return state;
    }
  }
};
