import classNames from "classnames";
import {useEffect} from "react";
import {uniqueId} from "underscore";
import ReactFocusLock from "react-focus-lock";
import {Color, getColorClassName, formatColorName} from "constants/colors";
import {Tooltip} from "components/Tooltip";
import "./ColorPicker.scss";

type ColorPickerProps = {
  className?: string;
  open: boolean;
  colors: Color[];
  activeColor: Color;
  selectColor: (color: Color) => void;
  attemptOpenColorPicker?: () => void; // get fired if color picker is closed and is clicked
  closeColorPicker: () => void;

  fitted?: boolean; // elements more narrow
  allowVertical?: boolean;
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

  if (!props.open) {
    return (
      <span
        className="color-picker__color-option color-picker__color-option--selected"
        aria-label={`current color${formatColorName(props.activeColor)}`}
        tabIndex={0}
        role="button"
        onClick={props.attemptOpenColorPicker}
      />
    );
  }

  return (
    <ReactFocusLock autoFocus className="fix-focus-lock-placement">
      <ul className={classNames(props.className, "color-picker", {"color-picker--allow-vertical": props.allowVertical, "color-picker--fitted": props.fitted})}>
        <li className={`${getColorClassName(props.activeColor)} color-picker__item`}>
          <button
            id={primColorAnchor}
            aria-label={formatColorName(props.activeColor)}
            title={formatColorName(props.activeColor)}
            onClick={() => props.selectColor(props.activeColor)}
            className={classNames("color-picker__item-button", {"color-picker__item-button--fitted": props.fitted})}
          >
            <div className="color-picker__color-option color-picker__color-option--selected" />
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
                // onMouseDown instead of onClick because onBlur has priority, and it might get closed before firing the event
                onMouseDown={() => props.selectColor(color)}
                className={classNames(color.toString, "color-picker__item-button", {"color-picker__item-button--fitted": props.fitted})}
              >
                <div className={`color-picker__color-option color-picker__color-option--${color.toString()}`} />
              </button>
            </li>
          );
        })}
      </ul>
    </ReactFocusLock>
  );
};
