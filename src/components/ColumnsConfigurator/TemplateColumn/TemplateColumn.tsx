import classNames from "classnames";
import {ReactComponent as VisibleIcon} from "assets/icons/visible.svg";
import {ReactComponent as HiddenIcon} from "assets/icons/hidden.svg";
import {ReactComponent as DeleteIcon} from "assets/icons/trash.svg";
import {ReactComponent as DnDIcon} from "assets/icons/drag-and-drop.svg";
import {TemplateColumnType} from "components/ColumnsConfigurator/ColumnsConfigurator";
import {getColorClassName} from "constants/colors";
import "./TemplateColumn.scss";
import {useSortable} from "@dnd-kit/sortable";
import {CSSProperties} from "react";
import {CSS} from "@dnd-kit/utilities";

type TemplateColumnProps = {
  column: TemplateColumnType;
  placement: "left" | "center" | "right";
};

export const TemplateColumn = ({column, placement}: TemplateColumnProps) => {
  const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: column.id});

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div className={classNames("template-column", `template-column--border-${placement}`, getColorClassName(column.color))} ref={setNodeRef} style={style} {...attributes}>
      <div className="template-column__name">{column.name}</div>
      <DnDIcon className="template-column__drag-element" {...listeners} />
      <div className="template-column__color" />
      {column.visible ? <VisibleIcon /> : <HiddenIcon />}
      <DeleteIcon />
    </div>
  );
};
