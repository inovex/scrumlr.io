import classNames from "classnames";
import "./DotButton.scss";

type DotButtonProps = {
  className?: string;
  onClick?: () => void;
  children?: React.ReactElement | string;
};

export const DotButton = (props: DotButtonProps) => (
  <button
    className={classNames("dot-button", props.className)}
    onClick={(e) => {
      e.stopPropagation();
      props.onClick?.();
    }}
  >
    {props.children}
  </button>
);
