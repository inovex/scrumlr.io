import {RefObject, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";

enum ValidationErrorType {
  REQUIRED = "REQUIRED",
}

type ValidationOptions = {
  requireInteraction?: boolean;
};

type InputValidationResult = {errorType: ValidationErrorType | null; errorMessage: string};

export const useInputValidation = (inputRef: RefObject<HTMLInputElement>, options?: ValidationOptions, userInteracted?: boolean): InputValidationResult => {
  const {t} = useTranslation();
  const [validationError, setValidationError] = useState<ValidationErrorType | null>(null);

  useEffect(() => {
    const validateInput = () => {
      if (!inputRef.current) return;

      const {current} = inputRef;
      const {validity} = current;

      // check if user interaction is required
      if (options?.requireInteraction && !userInteracted) {
        setValidationError(null);
        return;
      }
      // validation (add as required)
      if (validity.valueMissing) {
        setValidationError(ValidationErrorType.REQUIRED);
      } else {
        setValidationError(null);
      }
    };

    const inputElement = inputRef.current;

    if (inputElement) {
      inputElement.addEventListener("input", validateInput);
    }

    validateInput();

    return () => {
      if (inputElement) {
        inputElement.removeEventListener("input", validateInput);
      }
    };
  }, [inputRef, options?.requireInteraction, userInteracted]);

  const getErrorMessage = (): string => {
    if (!validationError) return "";

    return t(`Validation.${validationError}`);
  };

  return {
    errorType: validationError,
    errorMessage: getErrorMessage(),
  };
};
