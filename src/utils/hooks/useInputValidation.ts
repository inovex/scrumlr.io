import {RefObject, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";

enum ValidationErrorType {
  REQUIRED = "REQUIRED",
  // additional error types can be added here
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
      // add more checks here
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
