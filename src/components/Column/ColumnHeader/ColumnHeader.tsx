import {Column} from "store/features";
import {NoteInput} from "components/NoteInput";
import {ColumnNameDetails} from "components/Column/ColumnNameDetails/ColumnNameDetails";
import {ColumnSettings} from "components/Column/ColumnSettings";
import {useState} from "react";
import "./ColumnHeader.scss";

type ColumnProps = {
  column: Column;
};

export const ColumnHeader = ({column}: ColumnProps) => {
  const [openSettings, setOpenSettings] = useState(false);
  const onNameEdit = () => {};

  return (
    <div className="column-header">
      <ColumnNameDetails column={column} />
      <NoteInput column={column} />
      {openSettings ? <ColumnSettings column={column} onClose={() => setOpenSettings(false)} onNameEdit={onNameEdit} /> : <div className="asdasd">settings</div>}{" "}
    </div>
  );
};
