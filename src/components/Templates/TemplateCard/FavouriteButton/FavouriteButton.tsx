import classNames from "classnames";
import {ReactComponent as FavouriteIcon} from "assets/icons/star.svg";
import "./FavouriteButton.scss";

type FavouriteButtonProps = {
  className?: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
};

export const FavouriteButton = (props: FavouriteButtonProps) => (
  <button className={classNames(props.className, "favourite-button", {"favourite-button--active": props.active})} onClick={props.onClick} disabled={props.disabled}>
    <FavouriteIcon className="favourite-button__icon" />
  </button>
);
