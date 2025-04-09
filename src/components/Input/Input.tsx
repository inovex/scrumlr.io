import {Dispatch, FormEvent, SetStateAction, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import classNames from "classnames";
import {ReactComponent as IconSearch} from "assets/icons/search.svg";
import {ReactComponent as IconClear} from "assets/icons/close.svg";
import {ReactComponent as IconVisible} from "assets/icons/visible.svg";
import {ReactComponent as IconHidden} from "assets/icons/hidden.svg";
import {ReactComponent as IconError} from "assets/icons/warning.svg";
import {useInputValidation, ValidationErrorType} from "utils/hooks/useInputValidation";
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

  const {t} = useTranslation();

  const [userInteracted, setUserInteracted] = useState(false);

  const {errorType} = useInputValidation(inputRef, props.input, {requireInteraction: true}, userInteracted);

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
    if (errorType)
      return (
        <div className="input__icon-container input__icon-container--error">
          <IconError className="input__icon" aria-label="validation error" />
        </div>
      );
    if (!props.input) return null;
    if (props.type === "password") {
      if (passwordHidden) {
        return (
          <div className="input__icon-container input__icon-container--password-hidden" role="button" tabIndex={0} onClick={togglePasswordHidden}>
            <IconHidden className="input__icon" aria-label="password is hidden" />
          </div>
        );
      }
      return (
        <div className="input__icon-container input__icon-container--password-visible" role="button" tabIndex={0} onClick={togglePasswordHidden}>
          <IconVisible className="input__icon" aria-label="password is visible" />
        </div>
      );
    }
    return (
      <div className="input__icon-container input__icon-container--clear-icon" role="button" tabIndex={0} onClick={clearInput}>
        <IconClear className="input__icon" aria-label="clear input" />
      </div>
    );
  };

  const renderErrorMessage = () => {
    // this comparison is on purpose to confine the type, otherwise all validation errors have to be localized even if not tested for
    if (errorType !== ValidationErrorType.REQUIRED) return null;

    return <div className="input__error">{t(`CreateBoard.validation.${errorType}`)}</div>;
  };

  return (
    <div className={classNames(props.className, "input__root")}>
      <div
        className={classNames("input", `input--${props.type}`, `input--height-${props.height}`, {
          "input--disabled": props.disabled,
          "input__input--invalid": !!errorType,
        })}
      >
        {props.type === "search" && (
          <div className="input__icon-container input__icon-container--search-icon">
            <IconSearch className="input__icon" aria-label="logo of magnifying glass" />
          </div>
        )}
        <input
          ref={inputRef}
          className={classNames("input__input", `input__input--${props.type}`, {"input__input--invalid": !!errorType})}
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
