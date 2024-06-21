import {useTranslation} from "react-i18next";
import classNames from "classnames";
import {ReactComponent as SearchLogo} from "assets/icons/search.svg";
import "./SearchBar.scss";

type SearchBarProps = {
  className?: string;
};

export const SearchBar = (props: SearchBarProps) => {
  const {t} = useTranslation();

  return (
    <div className={classNames("search-bar", props.className)}>
      <div className="search-bar__logo-container">
        <SearchLogo className="search-bar__logo" aria-label="logo of magnifying glass" />
      </div>
      <input className="search-bar__input" type="text" placeholder={t("SearchBar.placeholder")} />
    </div>
  );
};
