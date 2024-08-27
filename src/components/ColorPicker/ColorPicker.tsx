import React from "react";
import {useDispatch} from "react-redux";
import {uniqueId} from "underscore";
import {Color} from "../../constants/colors";
import {Actions} from "../../store/action";
import {Tooltip} from "../Tooltip";

type ColorPickerProps = {
  id: string;
  name: string;
  visible: boolean;
  index: number;
  color: Color;
  onClose?: () => void;
  colors: Color[];
};

function formatColorName(input: string): string {
  return input
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const ColorPicker: React.FC<ColorPickerProps> = ({id, name, visible, index, color, onClose, colors}) => {
  const dispatch = useDispatch();
  const colorsWithoutSelectedColor = colors.filter((curColor) => curColor !== color);
  const primColorAnchor = uniqueId(`color-picker-${color.toString()}`);
  return (
    <ul className="color-picker">
      <li>
        <button
          id={primColorAnchor}
          aria-label={color.toString()}
          title={color.toString()}
          onClick={() => {
            onClose?.();
            dispatch(Actions.editColumn(id, {name, color, index, visible}));
          }}
        >
          <div className={`column__header-color-option column__header-color-option--${color.toString()}-selected`} />
        </button>
        <Tooltip anchorSelect={`#${primColorAnchor}`} content={color.toString()} />
      </li>
      {colorsWithoutSelectedColor.map((item) => {
        const anchor = uniqueId(`color-picker-${item.toString()}`);
        return (
          <li>
            <button
              id={anchor}
              aria-label={formatColorName(item.toString())}
              title={item.toString()}
              onClick={() => {
                onClose?.();
                dispatch(Actions.editColumn(id, {name, color: item, index, visible}));
              }}
            >
              <div className={`column__header-color-option column__header-color-option--${item.toString()}`} />
            </button>
          </li>
        );
      })}
    </ul>
  );
};
