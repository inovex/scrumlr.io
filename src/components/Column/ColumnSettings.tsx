import {Dispatch, FC, SetStateAction, useState} from "react";
import {Actions} from "store/action";
import {ReactComponent as HideIcon} from "assets/icon-hidden.svg";
import {ReactComponent as ShowIcon} from "assets/icon-visible.svg";
import {ReactComponent as EditIcon} from "assets/icon-edit.svg";
import {ReactComponent as PreviousIcon} from "assets/icon-arrow-previous.svg";
import {ReactComponent as NextIcon} from "assets/icon-arrow-next.svg";
import {ReactComponent as TrashIcon} from "assets/icon-delete.svg";
import {Color, getColorForIndex} from "constants/colors";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import "./ColumnSettings.scss";
import {useAppSelector} from "store";
import {useOnBlur} from "utils/hooks/useOnBlur";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {Toast} from "../../utils/Toast";
import {TEMPORARY_COLUMN_ID, TOAST_TIMER_SHORT} from "../../constants/misc";
import {ColorPicker} from "./ColorPicker";
// import classNames from "classnames";

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
            title={t("Column.deleteColumn")}
            onClick={() => {
              onClose?.();
              dispatch(Actions.deleteColumn(id));
            }}
          >
            <TrashIcon />
            {/* {t("Column.deleteColumn")} */}
          </button>
        </li>
        <li>
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
          {openedColorPicker && <ColorPicker id={id} name={name} visible={visible} index={index} />}
        </li>
        <li>
          <button
            title={t("Column.addColumnLeft")}
            onClick={() => {
              onClose?.();
              handleAddColumn(index);
            }}
          >
            <PreviousIcon />
            {/* {t("Column.addColumnLeft")} */}
          </button>
        </li>
        <li>
          {/* nur einen zu machen sieht man nicht? man muss zwei column right elemente haben um eins zu sehen */}
          <button
            title={t("Column.addColumnRight")}
            onClick={() => {
              onClose?.();
              handleAddColumn(index + 1);
            }}
          >
            <NextIcon />
            {/* {t("Column.addColumnRight")} */}
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              onClose?.();
              dispatch(Actions.editColumn(id, {name, color, index, visible: !visible}));
            }}
          >
            {visible ? <HideIcon title={t("Column.hideColumn")} /> : <ShowIcon title={t("Column.showColumn")} />}
            {/* {visible ? t("Column.hideColumn") : t("Column.showColumn")} */}
          </button>
        </li>
        <li>
          <button
            title={t("Column.editName")}
            onClick={() => {
              onNameEdit?.();
              onClose?.();
            }}
          >
            <EditIcon />
            {/* {t("Column.editName")} */}
          </button>
        </li>
        <li>
          <button
            aria-label="CloseIcon"
            title={t("Column.resetName")}
            className="column__header-menu-dropdown-edit-button"
            onClick={() => (setOpenColumnSet ? setOpenColumnSet((o) => !o) : () => {})}
          >
            <CloseIcon className="column__header-edit-button-icon" />
          </button>
        </li>
      </ul>
    </div>
  );
};
