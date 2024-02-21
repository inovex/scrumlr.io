/** This object lists board users object specific internal Redux Action types. */
import {Auth} from "types/auth";
import {Participant} from "types/participant";

/** This object lists board users object specific internal Redux Action types. */
export const ParticipantAction = {
  /*
   * ATTENTION:
   * Don't forget the `as` casting for each field, because the type inference
   * won't work otherwise (e.g. in reducers).
   */
  SetParticipants: "scrumlr.io/setParticipants" as const,
  CreatedParticipant: "scrumlr.io/createdParticipant" as const,
  UpdatedParticipant: "scrumlr.io/updatedParticipant" as const,
  SetUserBanned: "scrumlr.io/setUserBanned" as const,
  SetUserReadyStatus: "scrumlr.io/setUserReadyStatus" as const,
  SetRaisedHandStatus: "scrumlr.io/setRaisedHandStatus" as const,
  SetShowHiddenColumns: "scrumlr.io/setShowHiddenColumns" as const,
  EditSelf: "scrumlr.io/editSelf" as const,
  ChangePermission: "scrumlr.io/changePermission" as const,
  SetFocusInitiator: "scrumlr.io/setFocusInitiator" as const,
  ClearFocusInitiator: "scrumlr.io/clearFocusInitiator" as const,
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

  createdParticipant: (participant: Participant) => ({
    type: ParticipantAction.CreatedParticipant,
    participant,
  }),

  updatedParticipant: (participant: Participant) => ({
    type: ParticipantAction.UpdatedParticipant,
    participant,
  }),

  /**
   * Sets the ready status of a user by the given value. It will be applied immediately on the local
   * client and send to the server via the middleware and an API request.
   *
   * @param ready the ready state to set
   */
  setUserReadyStatus: (user: string, ready: boolean) => ({
    type: ParticipantAction.SetUserReadyStatus,
    user,
    ready,
  }),

  setRaisedHand: (user: string, raisedHand: boolean) => ({
    type: ParticipantAction.SetRaisedHandStatus,
    user,
    raisedHand,
  }),

  setShowHiddenColumns: (showHiddenColumns: boolean) => ({
    type: ParticipantAction.SetShowHiddenColumns,
    showHiddenColumns,
  }),

  /**
   * Set the ban status of a participant from a board session.
   */
  setUserBanned: (user: string, userName: string, banned: boolean) => ({
    type: ParticipantAction.SetUserBanned,
    user,
    userName,
    banned,
  }),

  /**
   * Edits a user. It will be applied immediately on the local client and send to the server via the middleware and an API request.
   * @param user
   */
  editSelf: (user: Auth) => ({
    type: ParticipantAction.EditSelf,
    user,
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

  setFocusInitiator: (participant: Participant) => ({
    type: ParticipantAction.SetFocusInitiator,
    participant,
  }),

  clearFocusInitiator: () => ({
    type: ParticipantAction.ClearFocusInitiator,
  }),
};

export type ParticipantReduxAction =
  | ReturnType<typeof ParticipantActionFactory.setParticipants>
  | ReturnType<typeof ParticipantActionFactory.createdParticipant>
  | ReturnType<typeof ParticipantActionFactory.updatedParticipant>
  | ReturnType<typeof ParticipantActionFactory.setUserReadyStatus>
  | ReturnType<typeof ParticipantActionFactory.setRaisedHand>
  | ReturnType<typeof ParticipantActionFactory.setShowHiddenColumns>
  | ReturnType<typeof ParticipantActionFactory.setUserBanned>
  | ReturnType<typeof ParticipantActionFactory.editSelf>
  | ReturnType<typeof ParticipantActionFactory.changePermission>
  | ReturnType<typeof ParticipantActionFactory.setFocusInitiator>
  | ReturnType<typeof ParticipantActionFactory.clearFocusInitiator>;
