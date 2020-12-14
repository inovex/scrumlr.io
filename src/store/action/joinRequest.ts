import {JoinRequestClientModel} from "types/joinRequest";

export const JoinRequestActionType = {
    AcceptJoinRequest: '@@scrumlr/acceptJoinRequest' as '@@scrumlr/acceptJoinRequest',
    RejectJoinRequest: '@@scrumlr/rejectJoinRequest' as '@@scrumlr/rejectJoinRequest',
    InitializeJoinRequests: '@@scrumlr/initializeJoinRequests' as '@@scrumlr/initializeJoinRequests',
    CreateJoinRequest: '@@scrumlr/createJoinRequest' as '@@scrumlr/createJoinRequest',
    UpdateJoinRequest: '@@scrumlr/updateJoinRequest' as '@@scrumlr/updateJoinRequest'
}

export const JoinRequestActionFactory = {
    acceptJoinRequest: (id: string, boardId: string, userId: string) => ({
        type: JoinRequestActionType.AcceptJoinRequest,
        id,
        boardId,
        userId
    }),
    rejectJoinRequest: (id: string, boardId: string, userId: string) => ({
        type: JoinRequestActionType.RejectJoinRequest,
        id,
        boardId,
        userId
    }),
    initializeJoinRequests: (joinRequests: JoinRequestClientModel[]) => ({
        type: JoinRequestActionType.InitializeJoinRequests,
        joinRequests
    }),
    createJoinRequest: (joinRequest: JoinRequestClientModel) => ({
        type: JoinRequestActionType.CreateJoinRequest,
        joinRequest
    }),
    updateJoinRequest: (joinRequest: JoinRequestClientModel) => ({
        type: JoinRequestActionType.UpdateJoinRequest,
        joinRequest
    })
}

export type JoinRequestReduxAction =
    | ReturnType<typeof JoinRequestActionFactory.acceptJoinRequest>
    | ReturnType<typeof JoinRequestActionFactory.rejectJoinRequest>
    | ReturnType<typeof JoinRequestActionFactory.initializeJoinRequests>
    | ReturnType<typeof JoinRequestActionFactory.createJoinRequest>
    | ReturnType<typeof JoinRequestActionFactory.updateJoinRequest>