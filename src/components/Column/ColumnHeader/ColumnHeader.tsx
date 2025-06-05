import {Column} from "store/features";
import {NoteInput} from "components/NoteInput";
import {ColumnNameDetails} from "components/Column/ColumnNameDetails/ColumnNameDetails";
import {ColumnSettings} from "components/Column/ColumnSettings";
import {useState} from "react";
import "./ColumnHeader.scss";

type ColumnProps = {
  column: Column;
  notesCount: number;
};

export const ColumnHeader = ({column, notesCount}: ColumnProps) => {
  const [openSettings, setOpenSettings] = useState(false);
  const onNameEdit = () => {};

  return (
    <div className="column-header">
      <ColumnNameDetails column={column} notesCount={notesCount} />
      <NoteInput column={column} />
      {openSettings ? <ColumnSettings column={column} onClose={() => setOpenSettings(false)} onNameEdit={onNameEdit} /> : <div className="asdasd">settings</div>}{" "}
    </div>
  );
};
