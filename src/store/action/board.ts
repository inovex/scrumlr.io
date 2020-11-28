/** This object lists board object specific internal Redux Action types. */
export const BoardActionType = {
    /*
     * ATTENTION:
     * Don't forget the `as` casting for each field, because the type inference
     * won't work otherwise (e.g. in reducers).
     */
    LeaveBoard: '@@SCRUMLR/leaveBoard' as '@@SCRUMLR/leaveBoard',
    JoinBoard: '@@SCRUMLR/joinBoard' as '@@SCRUMLR/joinBoard'
}

/** Factory or creator class of internal Redux board object specific actions. */
export const BoardActionFactory = {
    /*
     * ATTENTION:
     * Each action creator should be also listed in the type `BoardReduxAction`, because
     * the type inference won't work otherwise (e.g. in reducers).
     */
    leaveBoard: () => ({
        type: BoardActionType.LeaveBoard
    }),
    joinBoard: (boardId: string) => ({
        type: BoardActionType.JoinBoard,
        boardId: boardId
    })
}

export type BoardReduxAction =
    | ReturnType<typeof BoardActionFactory.leaveBoard>
    | ReturnType<typeof BoardActionFactory.joinBoard>



