import {EditColumnRequest} from "types/column";
import {Color} from "../../constants/colors";

/** This object lists column object specific internal Redux Action types. */
export const ColumnAction = {
  /*
   * ATTENTION:
   * Don't forget the `as` casting for each field, because the type inference
   * won't work otherwise (e.g. in reducers).
   */
  DeletedColumn: "scrumlr.io/deletedColumn" as const,
  CreateColumn: "scrumlr.io/createColumn" as const,
  CreateColumnOptimistically: "scrumlr.io/createColumnOptimistically" as const,
  EditColumn: "scrumlr.io/editColumn" as const,
  EditColumnOptimistically: "scrumlr.io/editColumnOptimistically" as const,
  DeleteColumn: "scrumlr.io/deleteColumn" as const,
  DeleteColumnOptimistically: "scrumlr.io/deleteColumnOptimistically" as const,
  CreatedColumn: "scrumlr.io/createdColumn" as const,
  UpdatedColumn: "scrumlr.io/updatedColumn" as const,
};

/** Factory or creator class of internal Redux column object specific actions. */
export const ColumnActionFactory = {
  /*
   * ATTENTION:
   * - Each action creator should also be listed in the type `ColumnReduxAction`, because
   * the type inference won't work otherwise (e.g. in reducers).
   *
   * - Actions suffixed with "Optimistically" only edit local state and should not persist changes in the backend.
   */

  /**
   * Creates an action which should be dispatched when the user edits a column.
   *
   * @param id the column id
   * @param column contains
   *  columnId: the edited column id
   *  name: the new name
   *  color: the new color of the column
   *  hidden: the new hidden state
   */
  deletedColumn: (columnId: string) => ({
    type: ColumnAction.DeletedColumn,
    columnId,
  }),
  editColumn: (id: string, column: EditColumnRequest) => ({
    type: ColumnAction.EditColumn,
    id,
    column,
  }),
  editColumnOptimistically: (id: string, column: EditColumnRequest) => ({
    type: ColumnAction.EditColumnOptimistically,
    id,
    column,
  }),
  deleteColumn: (id: string) => ({
    type: ColumnAction.DeleteColumn,
    id,
  }),
  deleteColumnOptimistically: (id: string) => ({
    type: ColumnAction.DeleteColumnOptimistically,
    id,
  }),
  createColumn: (column: {name: string; color: Color; visible: boolean; index: number}) => ({
    type: ColumnAction.CreateColumn,
    column,
  }),
  createColumnOptimistically: (column: {id: string; name: string; color: Color; visible: boolean; index: number}) => ({
    type: ColumnAction.CreateColumnOptimistically,
    column,
  }),
  createdColumn: (column: {id: string; name: string; color: Color; visible: boolean}, columnsOrder: string[]) => ({
    type: ColumnAction.CreatedColumn,
    column,
    columnsOrder,
  }),
  updatedColumn: (column: {id: string; name: string; color: Color; visible: boolean}, columnsOrder: string[]) => ({
    type: ColumnAction.UpdatedColumn,
    column,
    columnsOrder,
  }),
};

export type ColumnReduxAction =
  | ReturnType<typeof ColumnActionFactory.deletedColumn>
  | ReturnType<typeof ColumnActionFactory.deleteColumn>
  | ReturnType<typeof ColumnActionFactory.deleteColumnOptimistically>
  | ReturnType<typeof ColumnActionFactory.createColumn>
  | ReturnType<typeof ColumnActionFactory.createColumnOptimistically>
  | ReturnType<typeof ColumnActionFactory.editColumn>
  | ReturnType<typeof ColumnActionFactory.editColumnOptimistically>
  | ReturnType<typeof ColumnActionFactory.createdColumn>
  | ReturnType<typeof ColumnActionFactory.updatedColumn>;
