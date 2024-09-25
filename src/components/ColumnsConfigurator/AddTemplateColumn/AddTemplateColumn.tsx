import {Color, getColorClassName} from "constants/colors";
import {ReactComponent as AddColumnIcon} from "assets/icons/add-column.svg";
import classNames from "classnames";
import "./AddTemplateColumn.scss";

type AddTemplateColumnProps = {
  className?: string;
  alignment: "left" | "right";
  color: Color;
  onClick: () => void;
  disabled?: boolean;
};

export const AddTemplateColumn = (props: AddTemplateColumnProps) => (
  <div
    className={classNames(
      props.className,
      "add-template-column",
      `add-template-column--${props.alignment}`,
      {"add-template-column--disabled": props.disabled},
      getColorClassName(props.color)
    )}
  >
    <button className="add-template-column__button" onClick={props.onClick} disabled={props.disabled}>
      <AddColumnIcon className={classNames("add-template-column__icon", {"add-template-column__icon--disabled": props.disabled})} />
    </button>
  </div>
);
