import React, {useEffect} from "react";
import {useDispatch} from "react-redux";
import {uniqueId} from "underscore";
import ReactFocusLock from "react-focus-lock";
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
  closeColorPicker: () => void;
};

function formatColorName(input: string): string {
  return input
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const ColorPicker: React.FC<ColorPickerProps> = (props: ColorPickerProps) => {
  const dispatch = useDispatch();
  const colorsWithoutSelectedColor = props.colors.filter((curColor) => curColor !== props.color);
  const primColorAnchor = uniqueId(`color-picker-${props.color.toString()}`);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        props.closeColorPicker();
      }
    };

    document.addEventListener("keydown", handleKeyPress, true); // trigger in capture phase
    return () => document.removeEventListener("keydown", handleKeyPress, true);
  }, [props]);

  return (
    <ReactFocusLock autoFocus={false} className="fix-focus-lock-placement">
      <ul className="color-picker">
        <li>
          <button
            id={primColorAnchor}
            aria-label={props.color.toString()}
            title={props.color.toString()}
            onClick={() => {
              props.onClose?.();
              dispatch(Actions.editColumn(props.id, {name: props.name, color: props.color, index: props.index, visible: props.visible}));
            }}
          >
            <div className={`column__header-color-option column__header-color-option--${props.color.toString()}-selected`} />
          </button>
          <Tooltip anchorSelect={`#${primColorAnchor}`} content={props.color.toString()} />
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
                  props.onClose?.();
                  dispatch(Actions.editColumn(props.id, {name: props.name, color: item, index: props.index, visible: props.visible}));
                }}
              >
                <div className={`column__header-color-option column__header-color-option--${item.toString()}`} />
              </button>
            </li>
          );
        })}
      </ul>
    </ReactFocusLock>
  );
};
