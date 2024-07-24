import {Dispatch, FC, SetStateAction, useState} from "react";
import {Actions} from "store/action";
import {Hidden, Visible, Edit, ArrowLeft, ArrowRight, Trash, Close} from "components/Icon";
// import {Color, getColorClassName, getColorForIndex} from "constants/colors";
import {Color, getColorForIndex} from "constants/colors";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import "./ColumnSettings.scss";
import {useAppSelector} from "store";
// import classNames from "classnames";
import {useOnBlur} from "utils/hooks/useOnBlur";
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

  return (
    <div className="column__header-menu-dropdown" ref={columnSettingsRef}>
      <ul>
        <li>
          <button
            onClick={() => {
              onClose?.();
              dispatch(Actions.deleteColumn(id));
            }}
          >
            <Trash />
            {/* {t("Column.deleteColumn")} */}
          </button>
        </li>
        <li style={{display: "block"}}>
          <button
            aria-label="Color Picker"
            title="Color Picker"
            // className={classNames(getColorClassName("planning-pink"), "column__color-button")}
            // onClick={() => dispatch(Actions.editColumn(id, {name, color: "planning-pink", index, visible}))}
            // title={t("Column.settings")} className="column__header-edit-button"
            onClick={() => setOpenedColorPicker((o) => !o)}
          >
            <span className={`column__header-color-option ${color}_selected`} />
          </button>
          {openedColorPicker && <ColorPicker id={id} name={name} visible={visible} index={index} color={color} onClose={onClose} />}
        </li>
        <li>
          <button
            onClick={() => {
              onClose?.();
              handleAddColumn(index);
            }}
          >
            <ArrowLeft />
            {/* {t("Column.addColumnLeft")} */}
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              onClose?.();
              handleAddColumn(index + 1);
            }}
          >
            <ArrowRight />
            {/* {t("Column.addColumnRight")} */}
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              onNameEdit?.();
              onClose?.();
            }}
          >
            <Edit />
            {/* {t("Column.editName")} */}
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              onClose?.();
              dispatch(Actions.editColumn(id, {name, color, index, visible: !visible}));
            }}
          >
            {visible ? <Hidden /> : <Visible />}
            {/* {visible ? t("Column.hideColumn") : t("Column.showColumn")} */}
          </button>
        </li>
        <li>
          <button
            aria-label="CloseIcon"
            title={t("Column.resetName")}
            className="column__header-menu-dropdown-edit-button"
            onClick={() => (setOpenColumnSet ? setOpenColumnSet((o) => !o) : () => {})}
          >
            <Close className="column__header-edit-button-icon" />
          </button>
        </li>
      </ul>
    </div>
  );
};
