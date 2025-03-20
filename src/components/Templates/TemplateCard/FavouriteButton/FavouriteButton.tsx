import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {getColorClassName} from "constants/colors";
import {ReactComponent as FavouriteIcon} from "assets/icons/star.svg";
import {Tooltip} from "components/Tooltip";
import {uniqueId} from "underscore";
import "./FavouriteButton.scss";

type FavouriteButtonProps = {
  className?: string;
  active: boolean;
  onClick: () => void;
};

export const FavouriteButton = (props: FavouriteButtonProps) => {
  const {t} = useTranslation();
  const anchor = uniqueId("favourite-icon-");

  return (
    <>
      <button
        id={anchor}
        className={classNames(props.className, "favourite-button", {"favourite-button--active": props.active}, getColorClassName("planning-pink"))}
        onClick={props.onClick}
        tabIndex={0}
      >
        <FavouriteIcon className="favourite-icon" />
      </button>
      <Tooltip anchorSelect={`#${anchor}`} content={props.active ? t("Templates.TemplateCard.removeFavourite") : t("Templates.TemplateCard.addFavourite")} color="backlog-blue" />
    </>
  );
};
