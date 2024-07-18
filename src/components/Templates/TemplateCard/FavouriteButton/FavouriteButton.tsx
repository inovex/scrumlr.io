import classNames from "classnames";
import {getColorClassName} from "constants/colors";
import {ReactComponent as FavouriteIcon} from "assets/icons/star.svg";
import "./FavouriteButton.scss";

type FavouriteButtonProps = {
  className?: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
};

export const FavouriteButton = (props: FavouriteButtonProps) => (
  <button
    className={classNames(props.className, "favourite-button", {"favourite-button--active": props.active}, getColorClassName("planning-pink"))}
    onClick={props.onClick}
    disabled={props.disabled}
  >
    <FavouriteIcon className={classNames("favourite-button__icon", {"favourite-button__icon--active": props.active})} />
  </button>
);
