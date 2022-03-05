/** This object lists board users object specific internal Redux Action types. */
import {Participant} from "../../types/participant";

/** This object lists board users object specific internal Redux Action types. */
export const ParticipantAction = {
  /*
   * ATTENTION:
   * Don't forget the `as` casting for each field, because the type inference
   * won't work otherwise (e.g. in reducers).
   */
  SetParticipants: "scrumlr.io/setParticipants" as const,

  SetUserReadyStatus: "scrumlr.io/setUserReadyStatus" as const,
  SetRaisedHandStatus: "scrumlr.io/setRaisedHandStatus" as const,
  UpdateUser: "scrumlr.io/updateUser" as const,
  ChangePermission: "scrumlr.io/changePermission" as const,
  EditUserConfiguration: "scrumlr.io/editUserConfiguration" as const,
};

/** Factory or creator class of internal Redux board users object specific actions. */
export const ParticipantActionFactory = {
  /*
   * ATTENTION:
   * Each action creator should be also listed in the type `UsersReduxAction`, because
   * the type inference won't work otherwise (e.g. in reducers).
   */
  /**
   * Creates an action which should be dispatched when the server notifies about a changed list of users
   * for the current board.
   *
   * @param participants the list of users
   */
  setParticipants: (participants: Participant[]) => ({
    type: ParticipantAction.SetParticipants,
    participants,
  }),

  /**
   * Sets the ready status of a user by the given value. It will be applied immediately on the local
   * client and send to the server via the middleware and an API request.
   *
   * @param ready the ready state to set
   */
  setUserReadyStatus: (ready: boolean) => ({
    type: ParticipantAction.SetUserReadyStatus,
    ready,
  }),

  /**
   * Creates an action that should be dispatch when a moderator changes the permissions of a participant
   *
   * @param userId the identifier of the user whose permissions are being changed
   * @param moderator the flag whether the user receives or loses moderator permissions
   */
  changePermission: (userId: string, moderator: boolean) => ({
    type: ParticipantAction.ChangePermission,
    userId,
    moderator,
  }),
};

export type UsersReduxAction =
  | ReturnType<typeof ParticipantActionFactory.setParticipants>
  | ReturnType<typeof ParticipantActionFactory.setUserReadyStatus>
  | ReturnType<typeof ParticipantActionFactory.changePermission>;
