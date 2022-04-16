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

type ColumnSettingsProps = {
  id: string;
  name: string;
  color: Color;
  visible: boolean;
  index: number;
  onClose?: () => void;
  onNameEdit?: () => void;
};

export const ColumnSettings: VFC<ColumnSettingsProps> = ({id, name, color, visible, index, onClose, onNameEdit}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  return (
    <div className="column__header-menu-dropdown">
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
            className={getColorClassName("backlog-blue")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "backlog-blue", index, visible}))}
          />
          <button
            aria-label="Grooming Green"
            className={getColorClassName("grooming-green")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "grooming-green", index, visible}))}
          />
          <button
            aria-label="Lean Lilac"
            className={getColorClassName("lean-lilac")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "lean-lilac", index, visible}))}
          />
          <button
            aria-label="Online Orange"
            className={getColorClassName("online-orange")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "online-orange", index, visible}))}
          />
          <button
            aria-label="Planning Pink"
            className={getColorClassName("planning-pink")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "planning-pink", index, visible}))}
          />
          <button
            aria-label="Poker Purple"
            className={getColorClassName("poker-purple")}
            onClick={() => dispatch(Actions.editColumn(id, {name, color: "poker-purple", index, visible}))}
          />
          <button aria-label="Retro Red" className={getColorClassName("retro-red")} onClick={() => dispatch(Actions.editColumn(id, {name, color: "retro-red", index, visible}))} />
        </li>
      </ul>
    </div>
  );
};
