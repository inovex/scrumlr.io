import {UsersState} from "types/store";
import {UserClientModel} from "types/user";
import Parse from "parse";
import union from "lodash/union";
import without from "lodash/without";
import {ActionType, ReduxAction} from "../action";

const mapReadyState = (readyUsers: string[] = [], state: Omit<UsersState, "usersMarkedReady">) => {
  const newState = {
    admins: state.admins.map((current) => ({...current, ready: Boolean(readyUsers.find((user) => user === current.id))})),
    basic: state.basic.map((current) => ({...current, ready: Boolean(readyUsers.find((user) => user === current.id))})),
    all: state.all.map((current) => ({...current, ready: Boolean(readyUsers.find((user) => user === current.id))})),
    usersMarkedReady: readyUsers,
  };

  return newState;
};

export const usersReducer = (state: UsersState = {usersMarkedReady: [], admins: [], basic: [], all: []}, action: ReduxAction): UsersState => {
  switch (action.type) {
    case ActionType.SetUserReadyStatus: {
      let {usersMarkedReady} = state;
      if (usersMarkedReady !== undefined) {
        const userId = Parse.User.current()!.id;
        if (action.ready) {
          usersMarkedReady = union(usersMarkedReady, [userId]);
        } else {
          usersMarkedReady = without(usersMarkedReady, userId);
        }
        return mapReadyState(usersMarkedReady, state);
      }
      return state;
    }
    case ActionType.InitializeBoard:
    case ActionType.UpdatedBoard:
      return mapReadyState(action.board.usersMarkedReady, state);
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

      return mapReadyState(state.usersMarkedReady, newState);
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

      return mapReadyState(state.usersMarkedReady, newState);
    }
    case ActionType.UpdateUser: {
      const newState = {
        admins: state.admins,
        basic: state.basic,
        all: state.all,
      };

      // FIXME no updates here, this should be implemented
      const user = newState.all.find((member) => member.id === action.user.objectId);
      if (user) {
        // if needed
      }

      return mapReadyState(state.usersMarkedReady, newState);
    }
    default: {
      return state;
    }
  }
};
