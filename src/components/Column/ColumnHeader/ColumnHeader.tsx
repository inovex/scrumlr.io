import {Column} from "store/features";
import {NoteInput} from "components/NoteInput";
import {ColumnNameDetails} from "components/Column/ColumnNameDetails/ColumnNameDetails";
import "./ColumnHeader.scss";

type ColumnProps = {
  column: Column;
};

export const ColumnHeader = ({column}: ColumnProps) => (
  <div className="column-header">
    <ColumnNameDetails column={column} />
    <NoteInput column={column} />
  </div>
);
