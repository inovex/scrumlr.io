import {useTranslation} from "react-i18next";
import classNames from "classnames";
import {ReactComponent as SearchIcon} from "assets/icons/search.svg";
import {ReactComponent as CloseIcon} from "assets/icons/close.svg";
import "./SearchBar.scss";

type SearchBarProps = {
  className?: string;
  disabled?: boolean;
  closable?: boolean;
  onClose?: () => void;
};

export const SearchBar = (props: SearchBarProps) => {
  const {t} = useTranslation();

  return (
    <div className={classNames("search-bar", {"search-bar--disabled": props.disabled, "search-bar--closable": props.closable}, props.className)}>
      <div className="search-bar__icon-container search-bar__icon-container--search-icon">
        <SearchIcon className="search-bar__icon" aria-label="logo of magnifying glass" />
      </div>
      <input className="search-bar__input" type="text" placeholder={t("SearchBar.placeholder")} disabled={props.disabled} />
      {props.closable && (
        <div className="search-bar__icon-container search-bar__icon-container--close-icon" role="button" onClick={() => props.onClose?.()}>
          <CloseIcon className="search-bar__icon" aria-label="close button" />
        </div>
      )}
    </div>
  );
};
