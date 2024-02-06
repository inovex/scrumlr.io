import classNames from "classnames";
import {ReactNode} from "react";
import "./Tooltip.scss";

type TooltipProps = {
  anchorSelect?: string;
  children?: ReactNode;
  className?: string;
  content?: string;
  id?: string;
};

export const Tooltip = (props: TooltipProps) => (
    <div id={props.id} className={classNames("tooltip", props.className)}>
      {props.content}
    </div>
  );
