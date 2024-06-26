import React from "react";
// import {types} from "sass";
// import Color = types.Color;
import classNames from "classnames";
import {useDispatch} from "react-redux";
import {getColorClassName} from "../../constants/colors";
import {Actions} from "../../store/action";

// Definieren Sie die Schnittstelle für die Props der Komponente
export interface ColorPickerProps {
  id: string;
  name: string;
  visible: boolean;
  index: number;
}

// Definieren Sie die Komponente
export const ColorPicker: React.FC<ColorPickerProps> = ({id, name, visible, index}) => {
  const dispatch = useDispatch();

  return (
    <ul className="column__header-color-picker-dropdown">
      <li>
        <button
          aria-label="Planning Pink"
          title="Planning Pink"
          // className={classNames(getColorClassName("planning-pink"), "column__color-button")}
          onClick={() => dispatch(Actions.editColumn(id, {name, color: "planning-pink", index, visible}))}
          // title={t("Column.settings")} className="column__header-edit-button"
        >
          <div className="column__header-color-option planning-pink" />
        </button>
      </li>
      <li>
        {/* cool */}
        <button
          aria-label="Backlog Blue"
          title="Backlog Blue"
          className={classNames(getColorClassName("backlog-blue"), "column__color-button")}
          onClick={() => dispatch(Actions.editColumn(id, {name, color: "backlog-blue", index, visible}))}
        >
          <div className="column__header-color-option backlog-blue" />
        </button>
      </li>
      <li>
        {/* cool */}
        <button
          aria-label="Grooming Green"
          title="Grooming Green"
          className={classNames(getColorClassName("grooming-green"), "column__color-button")}
          onClick={() => dispatch(Actions.editColumn(id, {name, color: "grooming-green", index, visible}))}
        >
          <div className="column__header-color-option grooming-green" />
        </button>
      </li>
      <li>
        {/* cool */}
        <button
          aria-label="Poker Purple"
          title="Poker Purple"
          className={classNames(getColorClassName("poker-purple"), "column__color-button")}
          onClick={() => dispatch(Actions.editColumn(id, {name, color: "poker-purple", index, visible}))}
        >
          <div className="column__header-color-option poker-purple" />
        </button>
      </li>
      <li>
        {/* cool */}
        <button
          aria-label="Online Orange"
          title="Online Orange"
          className={classNames(getColorClassName("online-orange"), "column__color-button")}
          onClick={() => dispatch(Actions.editColumn(id, {name, color: "online-orange", index, visible}))}
        >
          <div className="column__header-color-option online-orange" />
        </button>
      </li>
      <li>
        {/* cool */}
        <button
          aria-label="Lean Lilac"
          title="Lean Lilac"
          className={classNames(getColorClassName("lean-lilac"), "column__color-button")}
          onClick={() => dispatch(Actions.editColumn(id, {name, color: "lean-lilac", index, visible}))}
        >
          <div className="column__header-color-option lean-lilac" />
        </button>
      </li>
      <li>
        {/* cool */}
        <button
          aria-label="Retro Red"
          title="Retro Red"
          className={classNames(getColorClassName("retro-red"), "column__color-button")}
          onClick={() => dispatch(Actions.editColumn(id, {name, color: "retro-red", index, visible}))}
        >
          <div className="column__header-color-option retro-red" />
        </button>
      </li>
    </ul>
  );
};
