import {Column} from "store/features";
import {NoteInput} from "components/NoteInput";
import {ColumnDetails, ColumnDetailsMode} from "components/Column/ColumnDetails/ColumnDetails";
import "./ColumnHeader.scss";
import {useState} from "react";

type ColumnProps = {
  column: Column;
  notesCount: number;
  isTemporary: boolean;
};

export const ColumnHeader = ({column, notesCount, isTemporary}: ColumnProps) => {
  const [columnDetailsMode, setColumnDetailsMode] = useState<ColumnDetailsMode>(isTemporary ? "edit" : "view");

  return (
    <div className="column-header">
      <ColumnDetails column={column} notesCount={notesCount} mode={columnDetailsMode} changeMode={setColumnDetailsMode} isTemporary={isTemporary} />
      <NoteInput column={column} />
    </div>
  );
};
