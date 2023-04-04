import {FC} from "react";
import {Actions} from "store/action";
import {ReactComponent as HideIcon} from "assets/icon-hidden.svg";
import {ReactComponent as ShowIcon} from "assets/icon-visible.svg";
import {ReactComponent as EditIcon} from "assets/icon-edit.svg";
import {ReactComponent as PreviousIcon} from "assets/icon-arrow-previous.svg";
import {ReactComponent as NextIcon} from "assets/icon-arrow-next.svg";
import {ReactComponent as TrashIcon} from "assets/icon-delete.svg";
import {Color, getColorClassName, getColorForIndex} from "constants/colors";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import "./ColumnSettings.scss";
import {useAppSelector} from "store";
import i18n from "i18next";
import classNames from "classnames";
import {useOnBlur} from "utils/hooks/useOnBlur";
import {Toast} from "../../utils/Toast";
import {TEMPORARY_COLUMN_ID} from "../../constants/misc";

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
  const columnSettingsRef = useOnBlur(onClose ?? (() => {}));

  const handleAddColumn = (columnIndex: number) => {
    if (!showHiddenColumns) {
      dispatch(Actions.setShowHiddenColumns(true));
      Toast.success(
        <div>
          <div>{i18n.t("Toast.hiddenColumnsVisible")}</div>
        </div>,
        3000
      );
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
              dispatch(Actions.editColumn(id, {name, color, index, visible: !visible}));
            }}
          >
            {visible ? <HideIcon /> : <ShowIcon />}
            {visible ? t("Column.hideColumn") : t("Column.showColumn")}
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              onNameEdit?.();
              onClose?.();
            }}
          >
            <EditIcon />
            {t("Column.editName")}
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              onClose?.();
              handleAddColumn(index);
            }}
          >
            <PreviousIcon />
            {t("Column.addColumnLeft")}
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              onClose?.();
              handleAddColumn(index + 1);
            }}
          >
            <NextIcon />
            {t("Column.addColumnRight")}
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              onClose?.();
              dispatch(Actions.deleteColumn(id));
            }}
          >
            <TrashIcon />
            {t("Column.deleteColumn")}
          </button>
        </li>
        <li>
          <button
            aria-label="Backlog Blue"
            title="Backlog Blue"
            className={classNames(getColorClassName("backlog-blue"), "column__color-button")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "backlog-blue", index, visible}))}
          />
          <button
            aria-label="Grooming Green"
            title="Grooming Green"
            className={classNames(getColorClassName("grooming-green"), "column__color-button")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "grooming-green", index, visible}))}
          />
          <button
            aria-label="Lean Lilac"
            title="Lean Lilac"
            className={classNames(getColorClassName("lean-lilac"), "column__color-button")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "lean-lilac", index, visible}))}
          />
          <button
            aria-label="Online Orange"
            title="Online Orange"
            className={classNames(getColorClassName("online-orange"), "column__color-button")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "online-orange", index, visible}))}
          />
          <button
            aria-label="Planning Pink"
            title="Planning Pink"
            className={classNames(getColorClassName("planning-pink"), "column__color-button")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "planning-pink", index, visible}))}
          />
          <button
            aria-label="Poker Purple"
            title="Poker Purple"
            className={classNames(getColorClassName("poker-purple"), "column__color-button")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "poker-purple", index, visible}))}
          />
          <button
            aria-label="Retro Red"
            title="Retro Red"
            className={classNames(getColorClassName("retro-red"), "column__color-button")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "retro-red", index, visible}))}
          />
        </li>
      </ul>
    </div>
  );
};
