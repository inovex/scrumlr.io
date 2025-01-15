import classNames from "classnames";
import {EditableTemplateColumn} from "store/features";
import {ReactComponent as CheckDoneIcon} from "assets/icons/check-done.svg";
import {ReactComponent as CloseIcon} from "assets/icons/close.svg";
import {ReactComponent as VisibleIcon} from "assets/icons/visible.svg";
import {ReactComponent as HiddenIcon} from "assets/icons/hidden.svg";
import {ReactComponent as DeleteIcon} from "assets/icons/trash.svg";
import {ReactComponent as DnDIcon} from "assets/icons/drag-and-drop.svg";
import {ColorPicker} from "components/ColorPicker/ColorPicker";
import {MiniMenu, MiniMenuItem} from "components/MiniMenu/MiniMenu";
import {TextArea} from "components/TextArea/TextArea";
import {Color, COLOR_ORDER, getColorClassName} from "constants/colors";
import {useSortable} from "@dnd-kit/sortable";
import {CSSProperties, useCallback, useEffect, useState} from "react";
import {CSS} from "@dnd-kit/utilities";
import {useStripeOffset} from "utils/hooks/useStripeOffset";
import "./ColumnsConfiguratorColumn.scss";
import {useTranslation} from "react-i18next";

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
  const {t} = useTranslation();

  const [openColorPicker, setOpenColorPicker] = useState(false);
  // tertiary state so we know where to put the focus
  const [editingDescription, setEditingDescription] = useState<"closed" | "nameFirst" | "descriptionFirst">("closed");
  // temporary state for description text as the changes have to be confirmed before applying
  const [description, setDescription] = useState("");

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

  const descriptionConfirmMiniMenu: MiniMenuItem[] = [
    {
      element: <CloseIcon />,
      label: t("Templates.ColumnsConfiguratorColumn.cancel"),
      onClick(): void {
        setEditingDescription("closed");
      },
    },
    {
      element: <CheckDoneIcon />,
      label: t("Templates.ColumnsConfiguratorColumn.save"),
      onClick(): void {
        props.editColumn?.(props.column, {description});
        setEditingDescription("closed");
      },
    },
  ];

  // update offset when dragging or columns change
  useEffect(() => {
    updateOffset();
  }, [props.activeDrag, props.activeDrop, props.allColumns, updateOffset]);

  const openDescriptionEditor = () => {
    setDescription(props.column.description); // init with current value
    setEditingDescription("descriptionFirst");
  };

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
      <div className="template-column__name-wrapper">
        <input
          className="template-column__name"
          value={props.column.name}
          onFocus={() => setEditingDescription("nameFirst")}
          onInput={(e) => props.editColumn?.(props.column, {name: e.currentTarget.value})}
        />
        {editingDescription !== "closed" ? (
          <div className="template-column__description-wrapper">
            <TextArea
              className="template-column__description-text-area"
              input={description}
              setInput={setDescription}
              placeholder={t("Templates.ColumnsConfiguratorColumn.descriptionPlaceholder")}
              embedded
              small
              autoFocus={editingDescription === "descriptionFirst"}
              onBlur={() => setEditingDescription("closed")}
            />
            <MiniMenu className="template-column__description-mini-menu" items={descriptionConfirmMiniMenu} small transparent />
          </div>
        ) : (
          <div className="template-column__inline-description" role="button" tabIndex={0} onClick={openDescriptionEditor}>
            {props.column.description ? props.column.description : t("Templates.ColumnsConfiguratorColumn.descriptionPlaceholder")}
          </div>
        )}
      </div>
      {/* TODO title and description are editable as one thing, can tab, show with timeout before saving. */}
      {!editingDescription && (
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
