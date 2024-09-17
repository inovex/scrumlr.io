import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {uniqueId} from "underscore";
import ReactFocusLock from "react-focus-lock";
import {Color, getColorClassName, formatColorName} from "constants/colors";
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

export const ColorPicker = (props: ColorPickerProps) => {
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
        <li className={`${getColorClassName(props.color)} color-picker__item`}>
          <button
            id={primColorAnchor}
            aria-label={formatColorName(props.color)}
            title={formatColorName(props.color)}
            onClick={() => {
              props.onClose?.();
              dispatch(Actions.editColumn(props.id, {name: props.name, color: props.color, index: props.index, visible: props.visible}));
            }}
            className="color-picker__item-button"
          >
            <div className="column__header-color-option column__header-color-option--selected" />
          </button>
          <Tooltip anchorSelect={`#${primColorAnchor}`} content={formatColorName(props.color)} />
        </li>
        {colorsWithoutSelectedColor.map((item) => {
          const anchor = uniqueId(`color-picker-${item.toString()}`);
          return (
            <li className={`${getColorClassName(item)} color-picker__item`}>
              <button
                id={anchor}
                aria-label={formatColorName(item)}
                title={formatColorName(item)}
                onClick={() => {
                  props.onClose?.();
                  dispatch(Actions.editColumn(props.id, {name: props.name, color: item, index: props.index, visible: props.visible}));
                }}
                className={`${item.toString()} color-picker__item-button`}
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
