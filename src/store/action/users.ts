/** This object lists board users object specific internal Redux Action types. */
import {UserClientModel} from "types/user";

/** This object lists board users object specific internal Redux Action types. */
export const UsersActionType = {
  /*
   * ATTENTION:
   * Don't forget the `as` casting for each field, because the type inference
   * won't work otherwise (e.g. in reducers).
   */
  SetUsers: "@@SCRUMLR/setUsers" as const,
  SetUserStatus: "@@SCRUMLR/setUserStatus" as const,
  ChangePermission: "@@SCRUMLR/changePermission" as const,
};

/** Factory or creator class of internal Redux board users object specific actions. */
export const UsersActionFactory = {
  /*
   * ATTENTION:
   * Each action creator should be also listed in the type `UsersReduxAction`, because
   * the type inference won't work otherwise (e.g. in reducers).
   */
  /**
   * Creates an action which should be dispatched when the server notifies about a changed list of users
   * for the current board.
   *
   * @param users the list of users
   * @param admin flag which indicates whether the list of users contains all admins or basic users
   */
  setUsers: (users: UserClientModel[], admin: boolean) => ({
    type: UsersActionType.SetUsers,
    users,
    admin,
  }),

  /**
   * Creates an action that should be dispatched when the server notifies about a changed status (online/offline) of
   * a user
   *
   * @param userId the user identifier
   * @param status flag which indeicates whether the user is online or went offline
   */
  setUserStatus: (userId: string, status: boolean) => ({
    type: UsersActionType.SetUserStatus,
    userId,
    status,
  }),

  /**
   * Creates an action that should be dispatch when a moderator changes the permissions of a participant
   *
   * @param userId the identifier of the user whose permissions are being changed
   * @param moderator the flag whether the user receives or loses moderator permissions
   */

  changePermission: (userId: string, moderator: boolean) => ({
    type: UsersActionType.ChangePermission,
    userId,
    moderator,
  }),
};

export type UsersReduxAction =
  | ReturnType<typeof UsersActionFactory.setUsers>
  | ReturnType<typeof UsersActionFactory.setUserStatus>
  | ReturnType<typeof UsersActionFactory.changePermission>;
