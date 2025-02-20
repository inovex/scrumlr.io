import {Dispatch, FormEvent, SetStateAction, useRef} from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);

  const {t} = useTranslation();

  const focusInput = () => inputRef.current?.focus();
  const updateInput = (e: FormEvent<HTMLInputElement>) => props.handleValueChange(e.currentTarget.value);
  const clearInput = () => props.handleValueChange("");

  return (
    <div className={classNames(props.className, "search-bar", {"search-bar--disabled": props.disabled})} onClick={focusInput}>
      <div className="search-bar__button search-bar__icon-container--search-icon">
        <SearchIcon className="search-bar__icon" aria-label="logo of magnifying glass" />
      </div>
      <input
        ref={inputRef}
        className="search-bar__input"
        type="text"
        placeholder={t("SearchBar.placeholder")}
        disabled={props.disabled}
        value={props.value}
        onInput={updateInput}
      />
      {props.value && (
        <button className="search-bar__button search-bar__button--clear-icon" onClick={clearInput}>
          <ClearIcon className="search-bar__icon" aria-label="clear button" />
        </button>
      )}
    </div>
  );
};
