import {AddColumnRequest, EditColumnRequest} from "types/column";

/** This object lists column object specific internal Redux Action types. */
export const ColumnActionType = {
  /*
   * ATTENTION:
   * Don't forget the `as` casting for each field, because the type inference
   * won't work otherwise (e.g. in reducers).
   */
  AddColumn: "@@SCRUMLR/addColumn" as const,
  EditColumn: "@@SCRUMLR/editColumn" as const,
  DeleteColumn: "@@SCRUMLR/deleteColumn" as const,
};

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
   * @param addColumnRequest contains
   *  name: the column name
   *  color: the color of the column
   *  hidden: the flag which indicates whether this column should be visible to all basic users
   */
  addColumn: (addColumnRequest: AddColumnRequest) => ({
    type: ColumnActionType.AddColumn,
    addColumnRequest,
  }),
  /**
   * Creates an action which should be dispatched when the user edits a column.
   *
   * @param editColumnRequest contains
   *  columnId: the edited column id
   *  name: the new name
   *  color: the new color of the column
   *  hidden: the new hidden state
   */
  editColumn: (editColumnRequest: EditColumnRequest) => ({
    type: ColumnActionType.EditColumn,
    editColumnRequest,
  }),
  /**
   * Creates an action which should be dispatched when the user wants to delete a column.
   *
   * @param columnId the column id
   */
  deleteColumn: (columnId: string) => ({
    type: ColumnActionType.DeleteColumn,
    columnId,
  }),
};

export type ColumnReduxAction =
  | ReturnType<typeof ColumnActionFactory.addColumn>
  | ReturnType<typeof ColumnActionFactory.editColumn>
  | ReturnType<typeof ColumnActionFactory.deleteColumn>;
