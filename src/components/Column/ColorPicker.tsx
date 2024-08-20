import React from "react";
import classNames from "classnames";
import {useDispatch} from "react-redux";
import {Color, getColorClassName} from "../../constants/colors";
import {Actions} from "../../store/action";

export interface ColorPickerProps {
  id: string;
  name: string;
  visible: boolean;
  index: number;
  color: Color;
  onClose?: () => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({id, name, visible, index, color, onClose}) => {
  const dispatch = useDispatch();

  return (
    <ul className="column__header-color-picker-dropdown">
      <li>
        <button
          aria-label={color.toString()}
          title={color.toString()}
          onClick={() => {
            onClose?.();
            dispatch(Actions.editColumn(id, {name, color, index, visible}));
          }}
        >
          <div className={`column__header-color-option ${color.toString()}`} />
        </button>
      </li>
      <li>
        {color.toString() !== "planning-pink" && (
          <button
            aria-label="Planning Pink"
            title="Planning Pink"
            onClick={() => {
              onClose?.();
              dispatch(Actions.editColumn(id, {name, color: "planning-pink", index, visible}));
            }}
          >
            <div className="column__header-color-option planning-pink" />
          </button>
        )}
      </li>
      <li>
        {color.toString() !== "backlog-blue" && (
          <button
            aria-label="Backlog Blue"
            title="Backlog Blue"
            className={classNames(getColorClassName("backlog-blue"), "column__color-button")}
            onClick={() => {
              onClose?.();
              dispatch(Actions.editColumn(id, {name, color: "backlog-blue", index, visible}));
            }}
          >
            <div className="column__header-color-option backlog-blue" />
          </button>
        )}
      </li>
      <li>
        {color.toString() !== "goal-green" && (
          <button
            aria-label="Grooming Green"
            title="Grooming Green"
            className={classNames(getColorClassName("goal-green"), "column__color-button")}
            onClick={() => {
              onClose?.();
              dispatch(Actions.editColumn(id, {name, color: "goal-green", index, visible}));
            }}
          >
            <div className="column__header-color-option goal-green" />
          </button>
        )}
      </li>
      <li>
        {color.toString() !== "poker-purple" && (
          <button
            aria-label="Poker Purple"
            title="Poker Purple"
            className={classNames(getColorClassName("poker-purple"), "column__color-button")}
            onClick={() => {
              onClose?.();
              dispatch(Actions.editColumn(id, {name, color: "poker-purple", index, visible}));
            }}
          >
            <div className="column__header-color-option poker-purple" />
          </button>
        )}
      </li>
      <li>
        {color.toString() !== "online-orange" && (
          <button
            aria-label="Online Orange"
            title="Online Orange"
            className={classNames(getColorClassName("online-orange"), "column__color-button")}
            onClick={() => {
              onClose?.();
              dispatch(Actions.editColumn(id, {name, color: "online-orange", index, visible}));
            }}
          >
            <div className="column__header-color-option online-orange" />
          </button>
        )}
      </li>
      <li>
        {color.toString() !== "value-violet" && (
          <button
            aria-label="Lean Lilac"
            title="Lean Lilac"
            className={classNames(getColorClassName("value-violet"), "column__color-button")}
            onClick={() => {
              onClose?.();
              dispatch(Actions.editColumn(id, {name, color: "value-violet", index, visible}));
            }}
          >
            <div className="column__header-color-option value-violet" />
          </button>
        )}
      </li>
      <li>
        {color.toString() !== "yielding-yellow" && (
          <button
            aria-label="Retro Red"
            title="Retro Red"
            className={classNames(getColorClassName("yielding-yellow"), "column__color-button")}
            onClick={() => {
              onClose?.();
              dispatch(Actions.editColumn(id, {name, color: "yielding-yellow", index, visible}));
            }}
          >
            <div className="column__header-color-option yielding-yellow" />
          </button>
        )}
      </li>
    </ul>
  );
};
