import {Column, EditColumnRequest} from "types/column";

/** This object lists column object specific internal Redux Action types. */
export const ColumnAction = {
  /*
   * ATTENTION:
   * Don't forget the `as` casting for each field, because the type inference
   * won't work otherwise (e.g. in reducers).
   */
  EditColumn: "scrumlr.io/editColumn" as const,
  UpdatedColumns: "scrumlr.io/updatedColumns" as const,
};

/** Factory or creator class of internal Redux column object specific actions. */
export const ColumnActionFactory = {
  /*
   * ATTENTION:
   * Each action creator should be also listed in the type `ColumnReduxAction`, because
   * the type inference won't work otherwise (e.g. in reducers).
   */

  /**
   * Creates an action which should be dispatched when the user edits a column.
   *
   * @param column contains
   *  columnId: the edited column id
   *  name: the new name
   *  color: the new color of the column
   *  hidden: the new hidden state
   */
  editColumn: (id: string, column: EditColumnRequest) => ({
    type: ColumnAction.EditColumn,
    id,
    column,
  }),

  updateColumns: (columns: Column[]) => ({
    type: ColumnAction.UpdatedColumns,
    columns,
  }),
};

export type ColumnReduxAction = ReturnType<typeof ColumnActionFactory.editColumn> | ReturnType<typeof ColumnActionFactory.updateColumns>;
