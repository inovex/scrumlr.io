import {FC} from "react";
import {Actions} from "store/action";
import {Hidden, Visible, Edit, ArrowLeft, ArrowRight, Trash} from "components/Icon";
import {Color, getColorClassName, getColorForIndex} from "constants/colors";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import "./ColumnSettings.scss";
import {useAppSelector} from "store";
import classNames from "classnames";
import {useOnBlur} from "utils/hooks/useOnBlur";
import {Toast} from "../../utils/Toast";
import {TEMPORARY_COLUMN_ID, TOAST_TIMER_SHORT} from "../../constants/misc";

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
              dispatch(Actions.editColumn(id, {name, color, index, visible: !visible}));
            }}
          >
            {visible ? <Hidden /> : <Visible />}
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
            <Edit />
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
            <ArrowLeft />
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
            <ArrowRight />
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
            <Trash />
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
            aria-label="Value Violet"
            title="Value Violet"
            className={classNames(getColorClassName("value-violet"), "column__color-button")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "value-violet", index, visible}))}
          />
          <button
            aria-label="Goal Green"
            title="Goal Green"
            className={classNames(getColorClassName("goal-green"), "column__color-button")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "goal-green", index, visible}))}
          />
          <button
            aria-label="Yielding Yellow"
            title="Yielding Yellow"
            className={classNames(getColorClassName("yielding-yellow"), "column__color-button")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "yielding-yellow", index, visible}))}
          />
          <button
            aria-label="Online Orange"
            title="Online Orange"
            className={classNames(getColorClassName("online-orange"), "column__color-button")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "online-orange", index, visible}))}
          />
        </li>
      </ul>
    </div>
  );
};
