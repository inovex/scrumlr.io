import {Color, getColorClassName} from "constants/colors";
import {ReactComponent as AddColumnIcon} from "assets/icons/add-column.svg";
import classNames from "classnames";
import {AddTemplateColumnAlignment} from "../ColumnsConfigurator.types";
import "./AddTemplateColumn.scss";

type AddTemplateColumnProps = {
  className?: string;
  alignment: AddTemplateColumnAlignment;
  color: Color;
  onClick: (alignment: AddTemplateColumnAlignment, color: Color) => void;
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
    <button className="add-template-column__button" onClick={() => props.onClick(props.alignment, props.color)} disabled={props.disabled}>
      <AddColumnIcon className={classNames("add-template-column__icon", {"add-template-column__icon--disabled": props.disabled})} />
    </button>
  </div>
);
