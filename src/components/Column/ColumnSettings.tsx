import {Dispatch, FC, SetStateAction, useState} from "react";
import {Actions} from "store/action";
import {Hidden, Visible, Edit, ArrowLeft, ArrowRight, Trash, Close} from "components/Icon";
import {Color, getColorForIndex, COLOR_ORDER} from "constants/colors";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import "./ColumnSettings.scss";
import "./ColorPicker.scss";
import {useAppSelector} from "store";
import {useOnBlur} from "utils/hooks/useOnBlur";
import {MiniMenu} from "components/MiniMenu/MiniMenu";
import {Toast} from "../../utils/Toast";
import {TEMPORARY_COLUMN_ID, TOAST_TIMER_SHORT} from "../../constants/misc";
import {ColorPicker} from "./ColorPicker";

type ColumnSettingsProps = {
  id: string;
  name: string;
  color: Color;
  visible: boolean;
  index: number;
  onClose?: () => void;
  onNameEdit?: () => void;
  setOpenColumnSet?: Dispatch<SetStateAction<boolean>>;
};

export const ColumnSettings: FC<ColumnSettingsProps> = ({id, name, color, visible, index, onClose, onNameEdit, setOpenColumnSet}) => {
  const {t} = useTranslation();
  const showHiddenColumns = useAppSelector((state) => state.participants?.self.showHiddenColumns);
  const dispatch = useDispatch();
  const columnSettingsRef = useOnBlur(onClose ?? (() => {}));
  const [openedColorPicker, setOpenedColorPicker] = useState(false);

  const handleAddColumn = (columnIndex: number) => {
    if (!showHiddenColumns) {
      dispatch(Actions.setShowHiddenColumns(true));
      Toast.success({title: t("Toast.hiddenColumnsVisible"), autoClose: TOAST_TIMER_SHORT});
    }
    const randomColor = getColorForIndex(Math.floor(Math.random() * 100));
    dispatch(Actions.createColumnOptimistically({id: TEMPORARY_COLUMN_ID, name: "", color: randomColor, visible: false, index: columnIndex}));
  };

  const renderColorPicker = () =>
    openedColorPicker ? (
      <ColorPicker id={id} name={name} visible={visible} index={index} color={color} onClose={onClose} colors={COLOR_ORDER} />
    ) : (
      <span className={`column__header-color-option ${color}_selected`} />
    );

  return (
    <div ref={columnSettingsRef} className="column_settings">
      <MiniMenu
        className=""
        items={[
          {
            label: t("Column.deleteColumn"),
            icon: <Trash />,
            onClick: () => {
              onClose?.();
              dispatch(Actions.deleteColumn(id));
            },
          },
          {label: t("Column.color"), icon: renderColorPicker(), onClick: () => setOpenedColorPicker((o) => !o)},
          {
            label: t("Column.addColumnLeft"),
            icon: <ArrowLeft />,
            onClick: () => {
              onClose?.();
              handleAddColumn(index);
            },
          },
          {
            label: t("Column.addColumnRight"),
            icon: <ArrowRight />,
            onClick: () => {
              onClose?.();
              handleAddColumn(index + 1);
            },
          },
          {
            label: visible ? t("Column.hideColumn") : t("Column.showColumn"),
            icon: visible ? <Hidden /> : <Visible />,
            onClick: () => {
              onClose?.();
              dispatch(Actions.editColumn(id, {name, color, index, visible: !visible}));
            },
          },
          {
            label: t("Column.editName"),
            icon: <Edit />,
            onClick: () => {
              onNameEdit?.();
              onClose?.();
            },
          },
          {
            label: t("Column.resetName"),
            icon: <Close />,
            onClick: () => (setOpenColumnSet ? setOpenColumnSet((o) => !o) : () => {}),
          },
        ]}
        applyTransform={false}
      />
    </div>
  );
};
