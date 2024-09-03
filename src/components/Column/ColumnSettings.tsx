import {Dispatch, FC, SetStateAction, useEffect, useState} from "react";
import {Actions} from "store/action";
import {Hidden, Visible, Edit, ArrowLeft, ArrowRight, Trash, Close} from "components/Icon";
import {Color, getColorForIndex, COLOR_ORDER} from "constants/colors";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import "./ColumnSettings.scss";
import "../ColorPicker/ColorPicker.scss";
import {useAppSelector} from "store";
import {useOnBlur} from "utils/hooks/useOnBlur";
import {MiniMenu} from "components/MiniMenu/MiniMenu";
import {Toast} from "../../utils/Toast";
import {TEMPORARY_COLUMN_ID, TOAST_TIMER_SHORT} from "../../constants/misc";
import {ColorPicker} from "../ColorPicker/ColorPicker";

type ColumnSettingsProps = {
  id: string;
  name: string;
  color: Color;
  visible: boolean;
  index: number;
  onClose?: () => void;
  onNameEdit?: () => void;
  setOpenColumnSet?: Dispatch<SetStateAction<boolean>>;
  closeColumnSettings: () => void;
};

export const ColumnSettings: FC<ColumnSettingsProps> = (props: ColumnSettingsProps) => {
  const {t} = useTranslation();
  const showHiddenColumns = useAppSelector((state) => state.participants?.self.showHiddenColumns);
  const dispatch = useDispatch();
  const columnSettingsRef = useOnBlur(props.onClose ?? (() => {}));
  const [openedColorPicker, setOpenedColorPicker] = useState(false);

  const handleAddColumn = (columnIndex: number) => {
    if (!showHiddenColumns) {
      dispatch(Actions.setShowHiddenColumns(true));
      Toast.success({title: t("Toast.hiddenColumnsVisible"), autoClose: TOAST_TIMER_SHORT});
    }
    const randomColor = getColorForIndex(Math.floor(Math.random() * 100));
    dispatch(Actions.createColumnOptimistically({id: TEMPORARY_COLUMN_ID, name: "", color: randomColor, visible: false, index: columnIndex}));
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !openedColorPicker) {
        props.closeColumnSettings();
      }
    };

    document.addEventListener("keydown", handleKeyPress, false); // trigger in bubble phase
    return () => document.removeEventListener("keydown", handleKeyPress, false);
  }, [openedColorPicker, props]);

  const renderColorPicker = () =>
    openedColorPicker ? (
      <ColorPicker
        id={props.id}
        name={props.name}
        visible={props.visible}
        index={props.index}
        color={props.color}
        onClose={props.onClose}
        colors={COLOR_ORDER}
        closeColorPicker={() => setOpenedColorPicker(false)}
      />
    ) : (
      <span className={`column__header-color-option column__header-color-option--${props.color}-selected`} />
    );

  const menuItems = [
    {
      label: t("Column.deleteColumn"),
      icon: <Trash />,
      onClick: () => {
        props.onClose?.();
        dispatch(Actions.deleteColumn(props.id));
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
        props.onClose?.();
        handleAddColumn(props.index);
      },
    },
    {
      label: t("Column.addColumnRight"),
      icon: <ArrowRight />,
      onClick: () => {
        props.onClose?.();
        handleAddColumn(props.index + 1);
      },
    },
    {
      label: props.visible ? t("Column.hideColumn") : t("Column.showColumn"),
      icon: props.visible ? <Hidden /> : <Visible />,
      onClick: () => {
        props.onClose?.();
        dispatch(Actions.editColumn(props.id, {name: props.name, color: props.color, index: props.index, visible: !props.visible}));
      },
    },
    {
      label: t("Column.editName"),
      icon: <Edit />,
      onClick: () => {
        props.onNameEdit?.();
        props.onClose?.();
      },
    },
    {
      label: t("Column.resetName"),
      icon: <Close />,
      onClick: () => (props.setOpenColumnSet ? props.setOpenColumnSet((o) => !o) : () => {}),
    },
  ];

  return (
    <div ref={columnSettingsRef} className="column_settings">
      <MiniMenu className="" items={menuItems} />
    </div>
  );
};
