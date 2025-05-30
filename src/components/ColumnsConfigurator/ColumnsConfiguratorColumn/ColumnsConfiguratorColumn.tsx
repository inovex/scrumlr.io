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
import {ColumnConfiguratorColumnNameDetails, OpenState} from "./ColumnConfiguratorColumnNameDetails/ColumnConfiguratorColumnNameDetails";
import {ColumnPlacement} from "../ColumnsConfigurator.types";
import "./ColumnsConfiguratorColumn.scss";

export type ColumnsConfiguratorColumnProps = {
  className?: string;
  column: EditableTemplateColumn;
  index: number;
  placement?: ColumnPlacement;
  activeDrag?: boolean;
  activeDrop?: boolean;
  allColumns: EditableTemplateColumn[];
  editColumn?: (templateColumn: EditableTemplateColumn, overwrite: Partial<EditableTemplateColumn>) => void;
  deleteColumn?: (templateColumn: EditableTemplateColumn) => void;
};

export const ColumnsConfiguratorColumn = (props: ColumnsConfiguratorColumnProps) => {
  const [titleEditState, setTitleEditState] = useState<OpenState>("closed");
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
  const disableDelete = props.allColumns.length <= 1;

  return (
    <div
      className={classNames(
        props.className,
        "columns-configurator-column",
        `columns-configurator-column--border-${props.placement ?? "ghost"}`,
        {
          "columns-configurator-column--even": props.index % 2 === 0,
          "columns-configurator-column--odd": props.index % 2 !== 0,
          "columns-configurator-column--hidden": !props.column.visible,
          "columns-configurator-column--active-drag": props.activeDrag,
          "columns-configurator-column--active-drop": props.activeDrop,
        },
        getColorClassName(props.column.color)
      )}
      ref={combinedRef}
      style={style}
      {...attributes}
    >
      <ColumnConfiguratorColumnNameDetails
        className="columns-configurator-column__name-details"
        name={props.column.name}
        description={props.column.description}
        openState={titleEditState}
        setOpenState={setTitleEditState}
        updateColumnTitle={(name, description) => props.editColumn?.(props.column, {name, description})}
      />
      {titleEditState === "closed" && (
        <div className="columns-configurator-column__menu">
          <DnDIcon
            className={classNames("columns-configurator-column__icon", "columns-configurator-column__icon--dnd", "columns-configurator-column__drag-element", {
              "columns-configurator-column__drag-element--dragging": props.activeDrag,
            })}
            {...listeners}
            data-cy="columns-configurator-column__drag-element"
          />
          <ColorPicker
            className={classNames(
              "columns-configurator-column__color-picker",
              {"columns-configurator-column__color-picker--open": openColorPicker},
              `columns-configurator-column__color-picker--column-${props.placement}`
            )}
            open={openColorPicker}
            colors={COLOR_ORDER}
            activeColor={props.column.color}
            selectColor={editColor}
            attemptOpenColorPicker={() => setOpenColorPicker(true)} // always allow to open
            closeColorPicker={() => setOpenColorPicker(false)}
            fitted
            dataCy="columns-configurator-column__color-picker"
          />
          <button
            className={classNames("columns-configurator-column__button", {"columns-configurator-column__button--disabled": false}, "column-configurator-column__visibility-button")}
            onClick={() => props.editColumn?.(props.column, {visible: !props.column.visible})}
          >
            {props.column.visible ? (
              <VisibleIcon
                className={classNames("columns-configurator-column__icon", "columns-configurator-column__icon--visible")}
                data-cy="columns-configurator-column__icon--visibility"
              />
            ) : (
              <HiddenIcon
                className={classNames("columns-configurator-column__icon", "columns-configurator-column__icon--hidden")}
                data-cy="columns-configurator-column__icon--visibility"
              />
            )}
          </button>
          <button
            className={classNames(
              "columns-configurator-column__button",
              {"columns-configurator-column__button--disabled": disableDelete},
              "column-configurator-column__delete-button"
            )}
            onClick={() => props.deleteColumn?.(props.column)}
            disabled={disableDelete}
          >
            <DeleteIcon className={classNames("columns-configurator-column__icon", "columns-configurator-column__icon--delete")} />
          </button>
        </div>
      )}
    </div>
  );
};
