import {Column} from "store/features";
import {useTranslation} from "react-i18next";
import "./ColumnNameDetails.scss";

type ColumnNameDetailsProps = {
  column: Column;
  notesCount: number;
};

export const ColumnNameDetails = (props: ColumnNameDetailsProps) => {
  const {t} = useTranslation();

  return (
    <div className="column-name-details">
      <div className="column-name-details__name-wrapper">
        <div className="column-name-details__name">{props.column.name}</div>
        <div className="column-name-details__notes-count">{props.notesCount}</div>
      </div>
      {props.column.description ? (
        <div className="column-name-details__description">{props.column.description}</div>
      ) : (
        <div className="column-name-details__description--placeholder">{t("Column.Header.descriptionPlaceholder")}</div>
      )}
    </div>
  );
};
