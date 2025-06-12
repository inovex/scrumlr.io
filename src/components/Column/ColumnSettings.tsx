import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useAppDispatch, useAppSelector} from "store";
import {Column, createColumnOptimistically, deleteColumn, editColumn, setShowHiddenColumns} from "store/features";
import {Color, COLOR_ORDER, getRandomColor} from "constants/colors";
import {TEMPORARY_COLUMN_ID, TOAST_TIMER_SHORT} from "constants/misc";
import {useOnBlur} from "utils/hooks/useOnBlur";
import {Toast} from "utils/Toast";
import {Hidden, Visible, Edit, ArrowLeft, ArrowRight, Trash, Close} from "components/Icon";
import {MiniMenu, MiniMenuItem} from "components/MiniMenu/MiniMenu";
import {ColorPicker} from "components/ColorPicker/ColorPicker";
import "./ColumnSettings.scss";
import classNames from "classnames";

type ColumnSettingsProps = {
  className: string;
  column: Column;
  onClose: () => void;
  onNameEdit: () => void;
};

// behaviour of the now smaller column menu and color picker needs to be defined, thus I disabled it for now
const ENABLE_VERTICAL = false;

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
    const randomColor = getRandomColor();
    dispatch(createColumnOptimistically({id: TEMPORARY_COLUMN_ID, name: "", description: "", color: randomColor, visible: false, index: columnIndex}));
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

  const menuItems: MiniMenuItem[] = [
    {
      label: t("Column.deleteColumn"),
      element: <Trash />,
      onClick: () => {
        props.onClose();
        dispatch(deleteColumn(props.column.id));
      },
    },
    {
      label: t("Column.color"),
      element: (
        <ColorPicker
          open={openedColorPicker}
          colors={COLOR_ORDER}
          activeColor={props.column.color}
          selectColor={onSelectColor}
          closeColorPicker={() => setOpenedColorPicker(false)}
          allowVertical={ENABLE_VERTICAL}
          small
        />
      ),
      onClick: () => setOpenedColorPicker((o) => !o),
    },
    {
      label: t("Column.addColumnLeft"),
      element: <ArrowLeft />,
      onClick: () => {
        props.onClose();
        handleAddColumn(props.column.index);
      },
    },
    {
      label: t("Column.addColumnRight"),
      element: <ArrowRight />,
      onClick: () => {
        props.onClose();
        handleAddColumn(props.column.index + 1);
      },
    },
    {
      label: props.column.visible ? t("Column.hideColumn") : t("Column.showColumn"),
      element: props.column.visible ? <Hidden /> : <Visible />,
      onClick: () => {
        props.onClose?.();
        dispatch(
          editColumn({
            id: props.column.id,
            column: {
              ...props.column,
              visible: !props.column.visible,
            },
          })
        );
      },
    },
    {
      label: t("Column.editName"),
      element: <Edit />,
      onClick: () => {
        props.onNameEdit();
        props.onClose();
      },
    },
    {
      label: t("Column.resetName"),
      element: <Close />,
      onClick: props.onClose,
    },
  ];

  return (
    <div ref={columnSettingsRef} className={classNames(props.className, "column-settings")}>
      <MiniMenu items={menuItems} focusBehaviour="trap" wrapToColumn={ENABLE_VERTICAL} small />
    </div>
  );
};
