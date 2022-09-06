import {FC} from "react";
import {useTranslation} from "react-i18next";
import {Column} from "../../../../types/column";

export interface ExportHintHiddenColumnsProps {
  columns: Column[];
}

export const ExportHintHiddenColumns: FC<ExportHintHiddenColumnsProps> = ({columns}) => {
  const hiddenColumns = columns.filter((col) => !col.visible);
  const {t} = useTranslation();

  if (hiddenColumns.length > 0) {
    return (
      <div>
        <p>{t("ExportHint.hint")}</p>
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
