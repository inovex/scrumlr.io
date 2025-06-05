import {Column} from "store/features";
import "./ColumnNameDetails.scss";

type ColumnNameDetailsProps = {
  column: Column;
};

export const ColumnNameDetails = (props: ColumnNameDetailsProps) => (
    <div className="column-name-details">
      <div className="column-name-details__name">{props.column.name}</div>
    </div>
  );
