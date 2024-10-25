import {useEffect} from "react";
import {uniqueId} from "underscore";
import ReactFocusLock from "react-focus-lock";
import {Color, getColorClassName, formatColorName} from "constants/colors";
import {Tooltip} from "components/Tooltip";

type ColorPickerProps = {
  colors: Color[];
  activeColor: Color;
  selectColor: (color: Color) => void;
  closeColorPicker: () => void;
};

export const ColorPicker = (props: ColorPickerProps) => {
  const colorsWithoutSelectedColor = props.colors.filter((curColor) => curColor !== props.activeColor);
  const primColorAnchor = uniqueId(`color-picker-${props.activeColor.toString()}`);

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
        <li className={`${getColorClassName(props.activeColor)} color-picker__item`}>
          <button
            id={primColorAnchor}
            aria-label={formatColorName(props.activeColor)}
            title={formatColorName(props.activeColor)}
            onClick={() => props.selectColor(props.activeColor)}
            className="color-picker__item-button"
          >
            <div className="column__header-color-option column__header-color-option--selected" />
          </button>
          <Tooltip anchorSelect={`#${primColorAnchor}`} content={formatColorName(props.activeColor)} />
        </li>
        {colorsWithoutSelectedColor.map((color) => {
          const anchor = uniqueId(`color-picker-${color.toString()}`);
          return (
            <li className={`${getColorClassName(color)} color-picker__item`}>
              <button
                id={anchor}
                aria-label={formatColorName(color)}
                title={formatColorName(color)}
                onClick={() => props.selectColor(color)}
                className={`${color.toString()} color-picker__item-button`}
              >
                <div className={`column__header-color-option column__header-color-option--${color.toString()}`} />
              </button>
            </li>
          );
        })}
      </ul>
    </ReactFocusLock>
  );
};
