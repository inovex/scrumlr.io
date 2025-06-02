import {Column} from "store/features";
import {NoteInput} from "components/NoteInput";
import "./ColumnHeader.scss";
import {ColumnNameDetails} from "components/Column/ColumnNameDetails/ColumnNameDetails";

type ColumnProps = {
  column: Column;
};

export const ColumnHeader = ({column}: ColumnProps) => (
  <div className="column__header">
    <ColumnNameDetails />
    <NoteInput column={column} />
  </div>
);
