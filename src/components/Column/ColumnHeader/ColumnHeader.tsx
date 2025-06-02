import {Column} from "store/features";
import {NoteInput} from "components/NoteInput";

import "./ColumnHeader.scss";

type ColumnProps = {
  column: Column;
};

export const ColumnHeader = ({column}: ColumnProps) => (
    <div className="column__header">
      <NoteInput column={column} />
    </div>
  );
