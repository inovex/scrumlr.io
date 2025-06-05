import {Column} from "store/features";
import "./ColumnNameDetails.scss";

type ColumnNameDetailsProps = {
  column: Column;
  notesCount: number;
};

export const ColumnNameDetails = (props: ColumnNameDetailsProps) => (
  <div className="column-name-details">
    <div className="column-name-details__name-wrapper">
      <div className="column-name-details__name">{props.column.name}</div>
      <div className="column-name-details__notes-count">{props.notesCount}</div>
    </div>
  </div>
);
