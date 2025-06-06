import {Column} from "store/features";
import {NoteInput} from "components/NoteInput";
import {ColumnNameDetails} from "components/Column/ColumnNameDetails/ColumnNameDetails";
import {ColumnSettings} from "components/Column/ColumnSettings";
import {useState} from "react";
import {ReactComponent as SettingsIcon} from "assets/icons/three-dots.svg";
import classNames from "classnames";
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
      {openSettings ? (
        <ColumnSettings
          className={classNames("column-header__settings", "column-header__settings--open")}
          column={column}
          onClose={() => setOpenSettings(false)}
          onNameEdit={onNameEdit}
        />
      ) : (
        <button
          className={classNames("column-header__settings", "column-header__settings--closed", "column-header__settings-icon-container")}
          onClick={() => setOpenSettings(true)}
        >
          <SettingsIcon className="column-header__settings-icon" />
        </button>
      )}
    </div>
  );
};
