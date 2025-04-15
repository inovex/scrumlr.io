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
    const {length} = props.columns;
    if (length === 1) {
      return "all";
    }
    if (index === 0) {
      return "first";
    }
    if (index === length - 1) {
      return "last";
    }
    return "center";
  };

  return (
    <div className={classNames(props.className, "columns-mini-view")}>
      {props.columns.map((column) => (
        <div
          key={column.id}
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
