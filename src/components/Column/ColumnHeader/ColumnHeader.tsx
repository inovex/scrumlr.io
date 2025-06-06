import {Column} from "store/features";
import {NoteInput} from "components/NoteInput";
import {ColumnDetails} from "components/Column/ColumnDetails/ColumnDetails";
import "./ColumnHeader.scss";

type ColumnProps = {
  column: Column;
  notesCount: number;
};

export const ColumnHeader = ({column, notesCount}: ColumnProps) => (
  <div className="column-header">
    <ColumnDetails column={column} notesCount={notesCount} />
    <NoteInput column={column} />
  </div>
);
