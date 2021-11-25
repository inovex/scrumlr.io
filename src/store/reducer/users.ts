import {UsersState} from "types/store";
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
    usersRaisedHands: state.usersRaisedHands,
  };

  return newState;
};

const mapRaisedHandState = (raisedHandUsers: string[] = [], state: Omit<UsersState, "usersRaisedHands">) => {
  const newState = {
    admins: state.admins.map((current) => ({...current, ready: Boolean(raisedHandUsers.find((user) => user === current.id))})),
    basic: state.basic.map((current) => ({...current, ready: Boolean(raisedHandUsers.find((user) => user === current.id))})),
    all: state.all.map((current) => ({...current, ready: Boolean(raisedHandUsers.find((user) => user === current.id))})),
    usersRaisedHands: raisedHandUsers,
    usersMarkedReady: state.usersMarkedReady,
  };

  return newState;
};

export const usersReducer = (state: UsersState = {usersRaisedHands: [], usersMarkedReady: [], admins: [], basic: [], all: []}, action: ReduxAction): UsersState => {
  switch (action.type) {
    case ActionType.SetUserReadyStatus:
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
    case ActionType.SetRaisedHandStatus:
      let {usersRaisedHands} = state;
      if (usersRaisedHands !== undefined) {
        if (action.configuration.raisedHand) {
          usersRaisedHands = union(usersRaisedHands, action.configuration.userId);
        } else {
          usersRaisedHands = usersRaisedHands.filter((id) => action.configuration.userId.find((user) => user === id) == undefined);
        }
        return mapRaisedHandState(usersRaisedHands, state);
      }
      return state;
    case ActionType.InitializeBoard:
    case ActionType.UpdatedBoard:
      return mapReadyState(action.board.usersMarkedReady, state);
    case ActionType.SetUsers: {
      const newState = {
        admins: state.admins,
        basic: state.basic,
        all: state.all,
        usersMarkedReady: state.usersMarkedReady,
        usersRaisedHands: state.usersRaisedHands,
      };

      if (action.admin) {
        newState.admins = action.users;
      } else {
        newState.basic = action.users;
      }

      // Update state and keep order
      newState.basic.forEach((member) => {
        if (newState.all.find((user) => user.id === member.id)) {
          newState.all.find((user) => user.id === member.id)!.admin = false;
        } else {
          newState.all.push(member);
        }
      });

      // Update state and keep order
      newState.admins.forEach((member) => {
        if (newState.all.find((admin) => admin.id === member.id)) {
          newState.all.find((admin) => admin.id === member.id)!.admin = true;
        } else {
          newState.all.push(member);
        }
      });

      // Remove outdated user
      newState.all = newState.all.filter((member) => newState.admins.find((admin) => admin.id === member.id) || newState.basic.find((user) => user.id === member.id));

      return mapReadyState(state.usersMarkedReady, newState);
    }
    case ActionType.SetUserStatus: {
      const newState = {
        admins: state.admins,
        basic: state.basic,
        all: state.all,
        usersMarkedReady: state.usersMarkedReady,
        usersRaisedHands: state.usersRaisedHands,
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
        usersMarkedReady: state.usersMarkedReady,
        usersRaisedHands: state.usersRaisedHands,
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
