import {Dispatch, FormEvent, SetStateAction} from "react";
import classNames from "classnames";
import {ReactComponent as SearchIcon} from "assets/icons/search.svg";
import {ReactComponent as ClearIcon} from "assets/icons/close.svg";
import "./SearchBar.scss";

type InputType = "text" | "password";

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
  const updateInput = (e: FormEvent<HTMLInputElement>) => props.setInput(e.currentTarget.value);
  const clearInput = () => props.setInput("");

  return (
    <div className={classNames(props.className, "search-bar", `search-bar--${props.type}`, {"search-bar--disabled": props.disabled})}>
      <div className="search-bar__icon-container search-bar__icon-container--search-icon">
        <SearchIcon className="search-bar__icon" aria-label="logo of magnifying glass" />
      </div>
      <input className="search-bar__input" type="text" placeholder={props.placeholder} disabled={props.disabled} tabIndex={0} value={props.input} onInput={updateInput} />
      {props.input && props.clearable && (
        <div className="search-bar__icon-container search-bar__icon-container--clear-icon" role="button" tabIndex={0} onClick={clearInput}>
          <ClearIcon className="search-bar__icon" aria-label="clear button" />
        </div>
      )}
    </div>
  );
};
