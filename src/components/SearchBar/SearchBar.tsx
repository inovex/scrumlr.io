import {Dispatch, FormEvent, SetStateAction} from "react";
import {useTranslation} from "react-i18next";
import classNames from "classnames";
import {ReactComponent as SearchIcon} from "assets/icons/search.svg";
import {ReactComponent as ClearIcon} from "assets/icons/close.svg";
import "./SearchBar.scss";

type InputType = "input" | "password";

type SearchBarProps = {
  className?: string;
  type: InputType;
  disabled?: boolean;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;

  placeholder?: string;
  clearable?: boolean;
};

/*
 * stateless search bar component.
 * if the input is not empty, it's clearable using the X button
 */
export const SearchBar = (props: SearchBarProps) => {
  const {t} = useTranslation();

  const updateInput = (e: FormEvent<HTMLInputElement>) => props.setInput(e.currentTarget.value);
  const clearInput = () => props.setInput("");

  return (
    <div className={classNames(props.className, "search-bar", {"search-bar--disabled": props.disabled})}>
      <div className="search-bar__icon-container search-bar__icon-container--search-icon">
        <SearchIcon className="search-bar__icon" aria-label="logo of magnifying glass" />
      </div>
      <input className="search-bar__input" type="text" placeholder={t("SearchBar.placeholder")} disabled={props.disabled} tabIndex={0} value={props.input} onInput={updateInput} />
      {props.input && (
        <div className="search-bar__icon-container search-bar__icon-container--clear-icon" role="button" tabIndex={0} onClick={clearInput}>
          <ClearIcon className="search-bar__icon" aria-label="clear button" />
        </div>
      )}
    </div>
  );
};
