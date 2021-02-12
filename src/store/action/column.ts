/** This object lists column object specific internal Redux Action types. */
export const ColumnActionType = {
    /*
     * ATTENTION:
     * Don't forget the `as` casting for each field, because the type inference
     * won't work otherwise (e.g. in reducers).
     */
    AddColumn: '@@SCRUMLR/addColumn' as '@@SCRUMLR/addColumn',
    EditColumn: '@@SCRUMLR/editColumn' as '@@SCRUMLR/editColumn',
    DeleteColumn: '@@SCRUMLR/deleteColumn' as '@@SCRUMLR/deleteColumn'
}

/** Factory or creator class of internal Redux column object specific actions. */
export const ColumnActionFactory = {
    /*
     * ATTENTION:
     * Each action creator should be also listed in the type `ColumnReduxAction`, because
     * the type inference won't work otherwise (e.g. in reducers).
     */
    /**
     * Creates an action which should be dispatched when the user wants to add a column to the current board.
     *
     * @param name the column name
     * @param hidden the flag which indicates whether this column should be visible to all basic users
     */
    addColumn: (name: string, hidden: boolean = false) => ({
        type: ColumnActionType.AddColumn,
        name,
        hidden
    }),
    /**
     * Creates an action which should be dispatched when the user edits a column.
     *
     * @param columnId the edited column id
     * @param name the new name
     * @param hidden the new hidden state
     */
    editColumn: (columnId: string, name?: string, hidden?: boolean) => ({
        type: ColumnActionType.EditColumn,
        columnId,
        name,
        hidden
    }),
    /**
     * Creates an action which should be dispatched when the user wants to delete a column.
     *
     * @param columnId the column id
     */
    deleteColumn: (columnId: string) => ({
        type: ColumnActionType.DeleteColumn,
        columnId
    })
}

export type ColumnReduxAction =
    | ReturnType<typeof ColumnActionFactory.addColumn>
    | ReturnType<typeof ColumnActionFactory.editColumn>
    | ReturnType<typeof ColumnActionFactory.deleteColumn>