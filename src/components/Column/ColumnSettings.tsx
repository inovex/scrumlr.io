import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useAppDispatch, useAppSelector} from "store";
import {Column, createColumnOptimistically, deleteColumn, editColumn, setShowHiddenColumns} from "store/features";
import {Color, getColorForIndex, COLOR_ORDER} from "constants/colors";
import {TEMPORARY_COLUMN_ID, TOAST_TIMER_SHORT} from "constants/misc";
import {useOnBlur} from "utils/hooks/useOnBlur";
import {Toast} from "utils/Toast";
import {Hidden, Visible, Edit, ArrowLeft, ArrowRight, Trash, Close} from "components/Icon";
import {MiniMenu, MiniMenuItem} from "components/MiniMenu/MiniMenu";
import {ColorPicker} from "components/ColorPicker/ColorPicker";
import "components/ColorPicker/ColorPicker.scss"; // color picker option
import "./ColumnSettings.scss";

type ColumnSettingsProps = {
  column: Column;
  onClose: () => void;
  onNameEdit: () => void;
};

export const ColumnSettings = (props: ColumnSettingsProps) => {
  const {t} = useTranslation();
  const showHiddenColumns = useAppSelector((state) => state.participants?.self!.showHiddenColumns);
  const dispatch = useAppDispatch();
  const columnSettingsRef = useOnBlur(props.onClose);
  const [openedColorPicker, setOpenedColorPicker] = useState(false);

  const handleAddColumn = (columnIndex: number) => {
    if (!showHiddenColumns) {
      dispatch(setShowHiddenColumns({showHiddenColumns: true}));
      Toast.success({title: t("Toast.hiddenColumnsVisible"), autoClose: TOAST_TIMER_SHORT});
    }
    const randomColor = getColorForIndex(Math.floor(Math.random() * COLOR_ORDER.length));
    dispatch(createColumnOptimistically({id: TEMPORARY_COLUMN_ID, name: "", color: randomColor, visible: false, index: columnIndex}));
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !openedColorPicker) {
        props.onClose();
      }
    };

    document.addEventListener("keydown", handleKeyPress, false); // trigger in bubble phase
    return () => document.removeEventListener("keydown", handleKeyPress, false);
  }, [openedColorPicker, props]);

  const onSelectColor = (color: Color) => {
    props.onClose();
    dispatch(
      editColumn({
        id: props.column.id,
        column: {
          ...props.column,
          color, // overwrite
        },
      })
    );
  };

  const renderColorPicker = () =>
    openedColorPicker ? (
      <ColorPicker colors={COLOR_ORDER} activeColor={props.column.color} selectColor={onSelectColor} closeColorPicker={() => setOpenedColorPicker(false)} />
    ) : (
      <span className="color-picker__color-option color-picker__color-option--selected" />
    );

  const menuItems: MiniMenuItem[] = [
    {
      label: t("Column.deleteColumn"),
      icon: <Trash />,
      onClick: () => {
        props.onClose();
        dispatch(deleteColumn(props.column.id));
      },
    },
    {
      label: t("Column.color"),
      icon: renderColorPicker(),
      onClick: () => setOpenedColorPicker((o) => !o),
    },
    {
      label: t("Column.addColumnLeft"),
      icon: <ArrowLeft />,
      onClick: () => {
        props.onClose();
        handleAddColumn(props.column.index);
      },
    },
    {
      label: t("Column.addColumnRight"),
      icon: <ArrowRight />,
      onClick: () => {
        props.onClose();
        handleAddColumn(props.column.index + 1);
      },
    },
    {
      label: props.column.visible ? t("Column.hideColumn") : t("Column.showColumn"),
      icon: props.column.visible ? <Hidden /> : <Visible />,
      onClick: () => {
        props.onClose?.();
        dispatch(
          editColumn({
            id: props.column.id,
            column: {
              name: props.column.name,
              color: props.column.color,
              index: props.column.index,
              visible: !props.column.visible,
            },
          })
        );
      },
    },
    {
      label: t("Column.editName"),
      icon: <Edit />,
      onClick: () => {
        props.onNameEdit();
        props.onClose();
      },
    },
    {
      label: t("Column.resetName"),
      icon: <Close />,
      onClick: props.onClose,
    },
  ];

  return (
    <div ref={columnSettingsRef} className="column-settings">
      <MiniMenu items={menuItems} />
    </div>
  );
};
