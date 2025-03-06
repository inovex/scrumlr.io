import {Dispatch, FormEvent, SetStateAction, useRef, useState} from "react";
import classNames from "classnames";
import {ReactComponent as SearchIcon} from "assets/icons/search.svg";
import {ReactComponent as ClearIcon} from "assets/icons/close.svg";
import {ReactComponent as IconVisible} from "assets/icons/visible.svg";
import {ReactComponent as IconHidden} from "assets/icons/hidden.svg";
import {useInputValidation} from "utils/hooks/useInputValidation";
import "./Input.scss";

type InputType = "text" | "search" | "password";

type SearchBarProps = {
  // technical
  className?: string;
  type: InputType;
  disabled?: boolean;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;

  // validation
  required?: boolean;

  // style
  placeholder?: string;
  height: "normal" | "larger"; // normal e.g. TemplateEditor, larger e.g. Boards
};

/*
 * stateless search bar component.
 * if the input is not empty, it's clearable using the X button
 */
export const Input = (props: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [userInteracted, setUserInteracted] = useState(false);

  const {errorType, errorMessage} = useInputValidation(inputRef, props.input, {requireInteraction: true}, userInteracted);

  const [passwordHidden, setPasswordHidden] = useState(true);
  // password input type is text when it's not hidden
  const inputDisplayType = props.type === "password" && passwordHidden ? "password" : "text";

  const updateInput = (e: FormEvent<HTMLInputElement>) => {
    setUserInteracted(true);
    props.setInput(e.currentTarget.value);
  };
  const clearInput = () => props.setInput("");

  const togglePasswordHidden = () => setPasswordHidden((curr) => !curr);

  const renderRightIcon = () => {
    if (!props.input) return null;
    if (props.type === "password") {
      if (passwordHidden) {
        return (
          <div className="input__icon-container input__icon-container--password-hidden" role="button" tabIndex={0} onClick={togglePasswordHidden}>
            <IconHidden className="input__icon" aria-label="clear button" />
          </div>
        );
      }
      return (
        <div className="input__icon-container input__icon-container--password-visible" role="button" tabIndex={0} onClick={togglePasswordHidden}>
          <IconVisible className="input__icon" aria-label="clear button" />
        </div>
      );
    }
    return (
      <div className="input__icon-container input__icon-container--clear-icon" role="button" tabIndex={0} onClick={clearInput}>
        <ClearIcon className="input__icon" aria-label="clear button" />
      </div>
    );
  };

  const renderErrorMessage = () => {
    if (!errorType) return null;

    return <div className="input__error">{errorMessage}</div>;
  };

  return (
    <div className="input__root">
      <div className={classNames(props.className, "input", `input--${props.type}`, `input--height-${props.height}`, {"input--disabled": props.disabled})}>
        {props.type === "search" && (
          <div className="input__icon-container input__icon-container--search-icon">
            <SearchIcon className="input__icon" aria-label="logo of magnifying glass" />
          </div>
        )}
        <input
          ref={inputRef}
          className={classNames("input__input", `input__input--${props.type}`)}
          type={inputDisplayType}
          placeholder={props.placeholder}
          disabled={props.disabled}
          tabIndex={0}
          value={props.input}
          onInput={updateInput}
          required={props.required}
        />
        {renderRightIcon()}
      </div>

      {renderErrorMessage()}
    </div>
  );
};
