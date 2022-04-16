import {VFC} from "react";
import {Actions} from "store/action";
import {ReactComponent as HideIcon} from "assets/icon-hidden.svg";
import {ReactComponent as ShowIcon} from "assets/icon-visible.svg";
import {ReactComponent as EditIcon} from "assets/icon-edit.svg";
import {ReactComponent as PreviousIcon} from "assets/icon-arrow-previous.svg";
import {ReactComponent as NextIcon} from "assets/icon-arrow-next.svg";
import {ReactComponent as TrashIcon} from "assets/icon-delete.svg";
import {Color, getColorClassName} from "constants/colors";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import "./ColumnSettings.scss";

type ColumnSettingsProps = {
  tabIndex: number;
  id: string;
  name: string;
  color: Color;
  visible: boolean;
  index: number;
  onClose?: () => void;
  onNameEdit?: () => void;
};

export const ColumnSettings: VFC<ColumnSettingsProps> = ({tabIndex, id, name, color, visible, index, onClose, onNameEdit}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  return (
    <div className="column__header-menu-dropdown">
      <ul>
        <li>
          <button
            tabIndex={tabIndex}
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
            tabIndex={tabIndex + 1}
            onClick={() => {
              // setColumnNameMode("EDIT");
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
            tabIndex={tabIndex + 2}
            onClick={() => {
              onClose?.();
              dispatch(Actions.createColumn({name: "New column", color: "backlog-blue", visible: true, index}));
            }}
          >
            <PreviousIcon />
            {t("Column.addColumnLeft")}
          </button>
        </li>
        <li>
          <button
            tabIndex={tabIndex + 3}
            onClick={() => {
              onClose?.();
              dispatch(Actions.createColumn({name: "New column", color: "backlog-blue", visible: true, index: index + 1}));
            }}
          >
            <NextIcon />
            {t("Column.addColumnRight")}
          </button>
        </li>
        <li>
          <button
            tabIndex={tabIndex + 4}
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
            tabIndex={tabIndex + 5}
            aria-label="Backlog Blue"
            title="Backlog Blue"
            className={getColorClassName("backlog-blue")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "backlog-blue", index, visible}))}
          />
          <button
            tabIndex={tabIndex + 6}
            aria-label="Grooming Green"
            title="Grooming Green"
            className={getColorClassName("grooming-green")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "grooming-green", index, visible}))}
          />
          <button
            tabIndex={tabIndex + 7}
            aria-label="Lean Lilac"
            title="Lean Lilac"
            className={getColorClassName("lean-lilac")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "lean-lilac", index, visible}))}
          />
          <button
            tabIndex={tabIndex + 8}
            aria-label="Online Orange"
            title="Online Orange"
            className={getColorClassName("online-orange")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "online-orange", index, visible}))}
          />
          <button
            tabIndex={tabIndex + 9}
            aria-label="Planning Pink"
            title="Planning Pink"
            className={getColorClassName("planning-pink")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "planning-pink", index, visible}))}
          />
          <button
            tabIndex={tabIndex + 10}
            aria-label="Poker Purple"
            title="Poker Purple"
            className={getColorClassName("poker-purple")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "poker-purple", index, visible}))}
          />
          <button
            tabIndex={tabIndex + 11}
            aria-label="Retro Red"
            title="Retro Red"
            className={getColorClassName("retro-red")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "retro-red", index, visible}))}
          />
        </li>
      </ul>
    </div>
  );
};
