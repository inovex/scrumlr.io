import {EditableTemplateColumn} from "store/features";
import classNames from "classnames";
import {getColorClassName} from "constants/colors";
import "./ColumnsMiniView.scss";

type ColumnsMiniViewProps = {
  className: string;
  columns: EditableTemplateColumn[];
};

export const ColumnsMiniView = (props: ColumnsMiniViewProps) => {
  const calcPlacement = (index: number) => {
    if (index === 0) {
      return "first";
    }
    if (index === props.columns.length - 1) {
      return "last";
    }
    return "center";
  };

  return (
    <div className={classNames(props.className, "columns-mini-view")}>
      {props.columns.map((column) => (
        <div
          className={classNames(
            "columns-mini-view__column",
            {"columns-mini-view__column--hidden": !column.visible},
            `columns-mini-view__column--border-${calcPlacement(column.index)}`,
            getColorClassName(column.color)
          )}
        >
          <span className="columns-mini-view__column-index">{column.index + 1}</span>
        </div>
      ))}
    </div>
  );
};
