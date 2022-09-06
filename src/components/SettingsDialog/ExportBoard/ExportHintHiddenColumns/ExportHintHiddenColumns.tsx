import {FC} from "react";
import {Column} from "../../../../types/column";

export interface ExportHintHiddenColumnsProps {
  columns: Column[];
}

export const ExportHintHiddenColumns: FC<ExportHintHiddenColumnsProps> = ({columns}) => {
  const hiddenColumns = columns.filter((col) => !col.visible);

  if (hiddenColumns.length > 0) {
    return (
      <div>
        <p>Warning: You have hidden columns which will not be exported.</p>
        <p>Columns:</p>
        <ul>
          {hiddenColumns.map((hiddenCol) => (
            <li>{hiddenCol.name}</li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
};
