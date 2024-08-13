import {Dispatch, FormEvent, SetStateAction} from "react";
import classNames from "classnames";
import {ReactComponent as SearchIcon} from "assets/icons/search.svg";
import {ReactComponent as ClearIcon} from "assets/icons/close.svg";
import "./Input.scss";

type InputType = "text" | "search" | "password";

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
export const Input = (props: SearchBarProps) => {
  const updateInput = (e: FormEvent<HTMLInputElement>) => props.setInput(e.currentTarget.value);
  const clearInput = () => props.setInput("");

  return (
    <div className={classNames(props.className, "input", `input--${props.type}`, {"input--disabled": props.disabled})}>
      {props.type === "search" && (
        <div className="input__icon-container input__icon-container--search-icon">
          <SearchIcon className="input__icon" aria-label="logo of magnifying glass" />
        </div>
      )}
      <input className="input__input" type="text" placeholder={props.placeholder} disabled={props.disabled} tabIndex={0} value={props.input} onInput={updateInput} />
      {props.input && props.clearable && (
        <div className="input__icon-container input__icon-container--clear-icon" role="button" tabIndex={0} onClick={clearInput}>
          <ClearIcon className="input__icon" aria-label="clear button" />
        </div>
      )}
    </div>
  );
};
