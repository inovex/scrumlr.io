import classNames from "classnames";
import {ReactComponent as VisibleIcon} from "assets/icons/visible.svg";
import {ReactComponent as HiddenIcon} from "assets/icons/hidden.svg";
import {ReactComponent as DeleteIcon} from "assets/icons/trash.svg";
import {ReactComponent as DnDIcon} from "assets/icons/drag-and-drop.svg";
import {TemplateColumnType} from "components/ColumnsConfigurator/ColumnsConfigurator";
import {getColorClassName} from "constants/colors";
import {useSortable} from "@dnd-kit/sortable";
import {CSSProperties} from "react";
import {CSS} from "@dnd-kit/utilities";
import "./TemplateColumn.scss";

type TemplateColumnProps = {
  className?: string;
  column: TemplateColumnType;
  index: number;
  placement?: "first" | "center" | "last";
  activeDrag?: boolean;
  activeDrop?: boolean;
};

export const TemplateColumn = (props: TemplateColumnProps) => {
  // the column id is used to determine sortable context
  const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: props.column.id});

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={classNames(
        props.className,
        "template-column",
        `template-column--border-${props.placement ?? "ghost"}`,
        {
          "template-column--even": props.index % 2 === 0,
          "template-column--odd": props.index % 2 !== 0,
          "template-column--active-drag": props.activeDrag,
          "template-column--active-drop": props.activeDrop,
        },
        getColorClassName(props.column.color)
      )}
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <div className="template-column__name">{props.column.name}</div>
      <div className="template-column__menu">
        <DnDIcon
          className={classNames("template-column__icon", "template-column__icon--dnd", "template-column__drag-element", {
            "template-column__drag-element--dragging": props.activeDrag,
          })}
          {...listeners}
        />
        <div className="template-column__color" />
        {props.column.visible ? (
          <VisibleIcon className={classNames("template-column__icon", "template-column__icon--visible")} />
        ) : (
          <HiddenIcon className={classNames("template-column__icon", "template-column__icon--hidden")} />
        )}
        <DeleteIcon className={classNames("template-column__icon", "template-column__icon--delete")} />
      </div>
    </div>
  );
};
