import classNames from "classnames";
import {EditableTemplateColumn} from "store/features";
import {ReactComponent as VisibleIcon} from "assets/icons/visible.svg";
import {ReactComponent as HiddenIcon} from "assets/icons/hidden.svg";
import {ReactComponent as DeleteIcon} from "assets/icons/trash.svg";
import {ReactComponent as DnDIcon} from "assets/icons/drag-and-drop.svg";
import {getColorClassName} from "constants/colors";
import {useSortable} from "@dnd-kit/sortable";
import {CSSProperties, useCallback, useEffect} from "react";
import {CSS} from "@dnd-kit/utilities";
import {useStripeOffset} from "utils/hooks/useStripeOffset";
import "./ColumnsConfiguratorColumn.scss";

type ColumnsConfiguratorColumnProps = {
  className?: string;
  column: EditableTemplateColumn;
  index: number;
  placement?: "first" | "center" | "last";
  activeDrag?: boolean;
  activeDrop?: boolean;
  allColumns: EditableTemplateColumn[];
  editColumn?: (templateColumn: EditableTemplateColumn, overwrite: Partial<EditableTemplateColumn>) => void;
  deleteColumn?: (templateColumn: EditableTemplateColumn) => void;
};

export const ColumnsConfiguratorColumn = (props: ColumnsConfiguratorColumnProps) => {
  const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: props.column.id});
  const {
    bindings: {ref: stripeRef, style: stripeStyle},
    updateOffset,
  } = useStripeOffset<HTMLDivElement>();

  // combine ref to be used by both offset hook and dnd kit
  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      stripeRef.current = node;
      setNodeRef(node);
    },
    [stripeRef, setNodeRef]
  );

  // combine styles from both offset hook and dnd kit
  const style: CSSProperties = {
    ...stripeStyle,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // update offset when dragging or columns change
  useEffect(() => {
    updateOffset();
  }, [props.activeDrag, props.activeDrop, props.allColumns, updateOffset]);

  return (
    <div
      className={classNames(
        props.className,
        "template-column",
        `template-column--border-${props.placement ?? "ghost"}`,
        {
          "template-column--even": props.index % 2 === 0,
          "template-column--odd": props.index % 2 !== 0,
          "template-column--hidden": !props.column.visible,
          "template-column--active-drag": props.activeDrag,
          "template-column--active-drop": props.activeDrop,
        },
        getColorClassName(props.column.color)
      )}
      ref={combinedRef}
      style={style}
      {...attributes}
    >
      <input className="template-column__name" value={props.column.name} onInput={(e) => props.editColumn?.(props.column, {name: e.currentTarget.value})} />
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
        <DeleteIcon className={classNames("template-column__icon", "template-column__icon--delete")} onClick={() => props.deleteColumn?.(props.column)} />
      </div>
    </div>
  );
};
