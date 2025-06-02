import "./ColumnNameDetails.scss";
import {ColumnSettings} from "components/Column/ColumnSettings";
import {Column} from "store/features";
import {useState} from "react";

type ColumnNameDetailsProps = {
  column: Column;
};

export const ColumnNameDetails = (props: ColumnNameDetailsProps) => {
  const [openSettings, setOpenSettings] = useState(false);
  const onNameEdit = () => {};

  return (
    <div className="column-name-details">
      <div className="column-name-details__title">Column Name</div>
      {openSettings ? <ColumnSettings column={props.column} onClose={() => setOpenSettings(false)} onNameEdit={onNameEdit} /> : <div className="asdasd">S</div>}{" "}
    </div>
  );
};
