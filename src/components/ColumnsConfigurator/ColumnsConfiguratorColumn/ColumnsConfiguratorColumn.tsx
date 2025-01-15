import classNames from "classnames";
import {EditableTemplateColumn} from "store/features";
import {ReactComponent as VisibleIcon} from "assets/icons/visible.svg";
import {ReactComponent as HiddenIcon} from "assets/icons/hidden.svg";
import {ReactComponent as DeleteIcon} from "assets/icons/trash.svg";
import {ReactComponent as DnDIcon} from "assets/icons/drag-and-drop.svg";
import {ColorPicker} from "components/ColorPicker/ColorPicker";
import {Color, COLOR_ORDER, getColorClassName} from "constants/colors";
import {useSortable} from "@dnd-kit/sortable";
import {CSSProperties, useCallback, useEffect, useState} from "react";
import {CSS} from "@dnd-kit/utilities";
import {useStripeOffset} from "utils/hooks/useStripeOffset";
import "./ColumnsConfiguratorColumn.scss";
import {ColumnConfiguratorColumnNameDetails} from "./ColumnConfiguratorColumnNameDetails/ColumnConfiguratorColumnNameDetails";

type ColumnsConfiguratorColumnProps = {
  className?: string;
  column: EditableTemplateColumn;
  index: number;
  placement?: "first" | "center" | "last" | "all";
  activeDrag?: boolean;
  activeDrop?: boolean;
  allColumns: EditableTemplateColumn[];
  editColumn?: (templateColumn: EditableTemplateColumn, overwrite: Partial<EditableTemplateColumn>) => void;
  deleteColumn?: (templateColumn: EditableTemplateColumn) => void;
};

export const ColumnsConfiguratorColumn = (props: ColumnsConfiguratorColumnProps) => {
  // const {t} = useTranslation();

  const [titleEditState, setTitleEditState] = useState<"closed" | "nameFirst" | "descriptionFirst">("closed");
  const [openColorPicker, setOpenColorPicker] = useState(false);

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

  const editColor = (color: Color) => {
    props.editColumn?.(props.column, {color});
    setOpenColorPicker(false);
  };

  // disable delete if only one column remains
  const disableDelete = !(props.allColumns.length > 1);

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
      <ColumnConfiguratorColumnNameDetails
        name={props.column.name}
        description={props.column.description}
        editState={titleEditState}
        setEditState={setTitleEditState}
        updateColumnTitle={(name, description) => props.editColumn?.(props.column, {name, description})}
      />
      {/* TODO title and description are editable as one thing, can tab, show with timeout before saving. */}
      {titleEditState === "closed" && (
        <div className="template-column__menu">
          <DnDIcon
            className={classNames("template-column__icon", "template-column__icon--dnd", "template-column__drag-element", {
              "template-column__drag-element--dragging": props.activeDrag,
            })}
            {...listeners}
          />
          <ColorPicker
            className={classNames("columns-configurator-column__color-picker", `columns-configurator-column__color-picker--column-${props.placement}`)}
            open={openColorPicker}
            colors={COLOR_ORDER}
            activeColor={props.column.color}
            selectColor={editColor}
            attemptOpenColorPicker={() => setOpenColorPicker(true)} // always allow to open
            closeColorPicker={() => setOpenColorPicker(false)}
            fitted
          />
          <button
            className={classNames("template-column__button", {"template-column__button--disabled": false})}
            onClick={() => props.editColumn?.(props.column, {visible: !props.column.visible})}
          >
            {props.column.visible ? (
              <VisibleIcon className={classNames("template-column__icon", "template-column__icon--visible")} />
            ) : (
              <HiddenIcon className={classNames("template-column__icon", "template-column__icon--hidden")} />
            )}
          </button>
          <button
            className={classNames("template-column__button", {"template-column__button--disabled": disableDelete})}
            onClick={() => props.deleteColumn?.(props.column)}
            disabled={disableDelete}
          >
            <DeleteIcon className={classNames("template-column__icon", "template-column__icon--delete")} />
          </button>
        </div>
      )}
    </div>
  );
};
