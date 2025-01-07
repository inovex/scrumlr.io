import "./ColumnsMiniView.scss";
import {EditableTemplateColumn} from "store/features";
import classNames from "classnames";

type ColumnsMiniViewProps = {
  className: string;
  columns: EditableTemplateColumn[];
};

export const ColumnsMiniView = (props: ColumnsMiniViewProps) => <div className={classNames(props.className, "columns-mini-view")}>Hello ColumnsMiniView</div>;
