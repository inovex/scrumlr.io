import {RefObject, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";

enum ValidationErrorType {
  REQUIRED = "REQUIRED",
  BAD_INPUT = "BAD_INPUT",
  PATTERN_MISMATCH = "PATTERN_MISMATCH",
  TYPE_MISMATCH = "TYPE_MISMATCH",
  RANGE = "RANGE",
}

type ValidationOptions = {
  requireInteraction?: boolean;
};

type InputValidationResult = {errorType: ValidationErrorType | null; errorMessage: string};

export const useInputValidation = (inputRef: RefObject<HTMLInputElement>, inputValue: string, options?: ValidationOptions, userInteracted?: boolean): InputValidationResult => {
  const {t} = useTranslation();
  const [validationError, setValidationError] = useState<ValidationErrorType | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const {current} = inputRef;
    const {validity} = current;

    // check if user interaction is required
    if (options?.requireInteraction && !userInteracted) {
      // setValidationError(null);
      return;
    }

    // validate based on input value
    if (validity.valueMissing) {
      setValidationError(ValidationErrorType.REQUIRED);
    } else if (validity.badInput) {
      setValidationError(ValidationErrorType.BAD_INPUT);
    } else if (validity.patternMismatch) {
      setValidationError(ValidationErrorType.PATTERN_MISMATCH);
    } else if (validity.typeMismatch) {
      setValidationError(ValidationErrorType.TYPE_MISMATCH);
    } else if (validity.rangeUnderflow || validity.rangeOverflow || validity.tooShort || validity.tooLong || validity.stepMismatch) {
      setValidationError(ValidationErrorType.RANGE);
    } else {
      setValidationError(null);
    }
  }, [inputRef, inputValue, options?.requireInteraction, userInteracted]);

  const getErrorMessage = (): string => {
    if (!validationError) return "";

    return t(`Validation.${validationError}`);
  };

  return {
    errorType: validationError,
    errorMessage: getErrorMessage(),
  };
};
