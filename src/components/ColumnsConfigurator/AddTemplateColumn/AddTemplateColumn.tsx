import {Color, getColorClassName} from "constants/colors";
import {ReactComponent as AddColumnIcon} from "assets/icons/add-column.svg";
import classNames from "classnames";
import "./AddTemplateColumn.scss";

type AddTemplateColumnProps = {
  className?: string;
  alignment: "left" | "right";
  color: Color;
};

export const AddTemplateColumn = (props: AddTemplateColumnProps) => (
    <div className={classNames(props.className, "add-template-column", `add-template-column--${props.alignment}`, getColorClassName(props.color))}>
      <AddColumnIcon className="add-template-column__icon" />
    </div>
  );
