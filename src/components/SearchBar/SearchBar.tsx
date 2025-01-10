import {Dispatch, FormEvent, SetStateAction} from "react";
import {useTranslation} from "react-i18next";
import classNames from "classnames";
import {ReactComponent as SearchIcon} from "assets/icons/search.svg";
import {ReactComponent as ClearIcon} from "assets/icons/close.svg";
import "./SearchBar.scss";

type SearchBarProps = {
  className?: string;
  disabled?: boolean;
  value: string;
  handleValueChange: Dispatch<SetStateAction<string>>;
};

/*
 * stateless search bar component.
 * if the input is not empty, it's clearable using the X button
 */
export const SearchBar = (props: SearchBarProps) => {
  const {t} = useTranslation();

  const updateInput = (e: FormEvent<HTMLInputElement>) => props.handleValueChange(e.currentTarget.value);
  const clearInput = () => props.handleValueChange("");

  return (
    <div className={classNames(props.className, "search-bar", {"search-bar--disabled": props.disabled})}>
      <div className="search-bar__icon-container search-bar__icon-container--search-icon">
        <SearchIcon className="search-bar__icon" aria-label="logo of magnifying glass" />
      </div>
      <input className="search-bar__input" type="text" placeholder={t("SearchBar.placeholder")} disabled={props.disabled} tabIndex={0} value={props.value} onInput={updateInput} />
      {props.value && (
        <div className="search-bar__icon-container search-bar__icon-container--clear-icon" role="button" tabIndex={0} onClick={clearInput}>
          <ClearIcon className="search-bar__icon" aria-label="clear button" />
        </div>
      )}
    </div>
  );
};
