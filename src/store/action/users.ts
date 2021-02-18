/** This object lists board users object specific internal Redux Action types. */
import { UserClientModel } from "types/user";

export const UsersActionType = {
  /*
   * ATTENTION:
   * Don't forget the `as` casting for each field, because the type inference
   * won't work otherwise (e.g. in reducers).
   */
  SetUsers: "@@SCRUMLR/setUsers" as "@@SCRUMLR/setUsers",
  SetUserStatus: "@@SCRUMLR/setUserStatus" as "@@SCRUMLR/setUserStatus",
};

/** Factory or creator class of internal Redux board users object specific actions. */
export const UsersActionFactory = {
  /*
   * ATTENTION:
   * Each action creator should be also listed in the type `UsersReduxAction`, because
   * the type inference won't work otherwise (e.g. in reducers).
   */
  setUsers: (users: UserClientModel[], admin: boolean) => ({
    type: UsersActionType.SetUsers,
    users,
    admin,
  }),

  setUserStatus: (userId: string, status: boolean) => ({
    type: UsersActionType.SetUserStatus,
    userId,
    status,
  }),
};

export type UsersReduxAction =
  | ReturnType<typeof UsersActionFactory.setUsers>
  | ReturnType<typeof UsersActionFactory.setUserStatus>;
