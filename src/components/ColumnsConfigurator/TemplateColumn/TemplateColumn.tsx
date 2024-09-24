import classNames from "classnames";
import {ReactComponent as VisibleIcon} from "assets/icons/visible.svg";
import {ReactComponent as HiddenIcon} from "assets/icons/hidden.svg";
import {ReactComponent as DeleteIcon} from "assets/icons/trash.svg";
import {ReactComponent as DnDIcon} from "assets/icons/drag-and-drop.svg";
import {TemplateColumnType} from "components/ColumnsConfigurator/ColumnsConfigurator";
import {getColorClassName} from "constants/colors";
import "./TemplateColumn.scss";

type TemplateColumnProps = {
  column: TemplateColumnType;
  placement: "left" | "center" | "right";
};

export const TemplateColumn = ({column, placement}: TemplateColumnProps) => (
  <div className={classNames("template-column", `template-column--border-${placement}`, getColorClassName(column.color))}>
    <div className="template-column__name">{column.name}</div>
    <DnDIcon />
    <div className="template-column__color" />
    {column.visible ? <VisibleIcon /> : <HiddenIcon />}
    <DeleteIcon />
  </div>
);
