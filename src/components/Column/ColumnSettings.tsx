import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import {FC, useState} from "react";
import {ReactComponent as HideIcon} from "assets/icon-hidden.svg";
import {ReactComponent as ShowIcon} from "assets/icon-visible.svg";
import {ReactComponent as EditIcon} from "assets/icon-edit.svg";
import {ReactComponent as PreviousIcon} from "assets/icon-arrow-previous.svg";
import {ReactComponent as NextIcon} from "assets/icon-arrow-next.svg";
import {ReactComponent as DotsIcon} from "assets/icon-dots.svg";
import {ReactComponent as TrashIcon} from "assets/icon-delete.svg";
import {ReactComponent as CloseIcon} from "assets/icon-close.svg";
import {Color, getColorForIndex} from "constants/colors";
import {TEMPORARY_COLUMN_ID, TOAST_TIMER_SHORT} from "constants/misc";
import {useAppSelector} from "store";
import {Actions} from "store/action";
import {Toast} from "utils/Toast";
import "./ColumnSettings.scss";

type ColumnSettingsProps = {
  id: string;
  name: string;
  color: Color;
  visible: boolean;
  index: number;
  onClose?: () => void;
  onNameEdit?: () => void;
};

export const ColumnSettings: FC<ColumnSettingsProps> = ({id, name, color, visible, index, onClose, onNameEdit}) => {
  const {t} = useTranslation();
  const showHiddenColumns = useAppSelector((state) => state.participants?.self.showHiddenColumns);
  const dispatch = useDispatch();

  const [isActive, setIsActive] = useState(false);

  const handleAddColumn = (columnIndex: number) => {
    if (!showHiddenColumns) {
      dispatch(Actions.setShowHiddenColumns(true));
      Toast.success({title: t("Toast.hiddenColumnsVisible"), autoClose: TOAST_TIMER_SHORT});
    }
    const randomColor = getColorForIndex(Math.floor(Math.random() * 100));
    dispatch(Actions.createColumnOptimistically({id: TEMPORARY_COLUMN_ID, name: "", color: randomColor, visible: false, index: columnIndex}));
  };

  return (
    <ul className={classNames("column-settings", {"column-settings--open": isActive})}>
      <li>
        <button aria-label={t("Column.editName")} onClick={() => setIsActive((curr) => !curr)}>
          {isActive ? <CloseIcon /> : <DotsIcon />}
        </button>
      </li>
      <li>
        <button
          aria-label={t("Column.editName")}
          onClick={() => {
            onNameEdit?.();
            onClose?.();
          }}
        >
          <EditIcon />
        </button>
      </li>
      <li>
        <button
          aria-label={visible ? t("Column.hideColumn") : t("Column.showColumn")}
          onClick={() => {
            onClose?.();
            dispatch(Actions.editColumn(id, {name, color, index, visible: !visible}));
          }}
        >
          {visible ? <HideIcon /> : <ShowIcon />}
        </button>
      </li>
      <li>
        <button
          aria-label={t("Column.addColumnRight")}
          onClick={() => {
            onClose?.();
            handleAddColumn(index + 1);
          }}
        >
          <NextIcon />
        </button>
      </li>
      <li>
        <button
          aria-label={t("Column.addColumnLeft")}
          onClick={() => {
            onClose?.();
            handleAddColumn(index);
          }}
        >
          <PreviousIcon />
        </button>
      </li>
      <li>
        <button aria-label="Change color">
          <PreviousIcon />
        </button>
      </li>
      <li>
        <button
          aria-label={t("Column.deleteColumn")}
          onClick={() => {
            onClose?.();
            dispatch(Actions.deleteColumn(id));
          }}
        >
          <TrashIcon />
        </button>
      </li>
    </ul>
  );
};
