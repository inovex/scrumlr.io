import classNames from "classnames";
import {getColorClassName} from "constants/colors";
import {ReactComponent as FavouriteIcon} from "assets/icons/star.svg";
import "./FavouriteButton.scss";

type FavouriteButtonProps = {
  className?: string;
  active: boolean;
  onClick: () => void;
};

export const FavouriteButton = (props: FavouriteButtonProps) => (
  <FavouriteIcon
    className={classNames(props.className, "favourite-button", {"favourite-button--active": props.active}, getColorClassName("planning-pink"))}
    role="button"
    onClick={props.onClick}
    tabIndex={0}
  />
);
