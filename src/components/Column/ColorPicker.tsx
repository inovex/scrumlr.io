import React from "react";
import {types} from "sass";
import Color = types.Color;
import classNames from "classnames";
import {getColorClassName} from "../../constants/colors";
import {Actions} from "../../store/action";
import {useDispatch} from "react-redux";

// Definieren Sie die Schnittstelle für die Props der Komponente
export interface ColorPickerProps {
  id: string;
  name: string;
  color: Color;
  visible: boolean;
  index: number;
}

// Definieren Sie die Komponente
export const ColorPicker: React.FC<ColorPickerProps> = ({id, name, color, visible, index}) => {
  const dispatch = useDispatch();

  return (
    <div>
      <button
        aria-label="Planning Pink"
        title="Planning Pink"
        // className={classNames(getColorClassName("planning-pink"), "column__color-button")}
        // onClick={() => dispatch(Actions.editColumn(id, {name, color: "planning-pink", index, visible}))}
      >
        <span className="column__header-color-option color_pink" />
        <ul className="column__header-color-picker-dropdown">
          <li>
            <button
              aria-label="Backlog Blue"
              title="Backlog Blue"
              className={classNames(getColorClassName("backlog-blue"), "column__color-button")}
              onClick={() => dispatch(Actions.editColumn(id, {name, color: "backlog-blue", index, visible}))}
            >
              <div className="column__header-color-option color_blue" />
            </button>
            <button
              aria-label="Grooming Green"
              title="Grooming Green"
              className={classNames(getColorClassName("grooming-green"), "column__color-button")}
              onClick={() => dispatch(Actions.editColumn(id, {name, color: "grooming-green", index, visible}))}
            >
              <div className="column__header-color-option color_green" />
            </button>
            <button
              aria-label="Poker Purple"
              title="Poker Purple"
              className={classNames(getColorClassName("poker-purple"), "column__color-button")}
              onClick={() => dispatch(Actions.editColumn(id, {name, color: "poker-purple", index, visible}))}
            >
              <div className="column__header-color-option color_violet" />
            </button>
            <button
              aria-label="Online Orange"
              title="Online Orange"
              className={classNames(getColorClassName("online-orange"), "column__color-button")}
              onClick={() => dispatch(Actions.editColumn(id, {name, color: "online-orange", index, visible}))}
            >
              <div className="column__header-color-option color_orange" />
            </button>
            <button
              aria-label="Lean Lilac"
              title="Lean Lilac"
              className={classNames(getColorClassName("lean-lilac"), "column__color-button")}
              onClick={() => dispatch(Actions.editColumn(id, {name, color: "lean-lilac", index, visible}))}
            >
              <div className="column__header-color-option color_purple" />
            </button>
            <button
              aria-label="Retro Red"
              title="Retro Red"
              className={classNames(getColorClassName("retro-red"), "column__color-button")}
              onClick={() => dispatch(Actions.editColumn(id, {name, color: "retro-red", index, visible}))}
            >
              <div className="column__header-color-option color_yellow" />
            </button>
          </li>
        </ul>
      </button>
    </div>
  );
};
