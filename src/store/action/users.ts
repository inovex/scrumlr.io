/** This object lists board users object specific internal Redux Action types. */
import {UserClientModel} from "types/user";

/** This object lists board users object specific internal Redux Action types. */
export const UsersActionType = {
    /*
     * ATTENTION:
     * Don't forget the `as` casting for each field, because the type inference
     * won't work otherwise (e.g. in reducers).
     */
    SetUsers: '@@SCRUMLR/setUsers' as '@@SCRUMLR/setUsers'
}

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
        admin
    })
}

export type UsersReduxAction =
    | ReturnType<typeof UsersActionFactory.setUsers>