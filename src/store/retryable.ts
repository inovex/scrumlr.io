import {Dispatch} from "react";
import {AsyncThunkAction} from "@reduxjs/toolkit";
import i18n, {resources} from "i18n";
import {ApplicationState} from "store";
import {Toast} from "utils/Toast";

type ErrorKey = keyof (typeof resources.en.translation)["Error"];

/**
 * function which tries the API call, and if it fails shows a toast,
 * which dispatches the action again, effectively retrying itself.
 * @param promiseFn the API call function
 * @param dispatch the dispatch function of the store
 * @param action the dispatched action (makes sense to use the same as the one dispatched initially)
 * @param errorKey the error key to be used in the toast message.
 */
export const retryable = async <ResponseType, ActionReturnType, ActionPayload>(
  promiseFn: () => Promise<ResponseType>,
  dispatch: Dispatch<AsyncThunkAction<ActionReturnType, ActionPayload, {state: ApplicationState}>>,
  action: () => AsyncThunkAction<ActionReturnType, ActionPayload, {state: ApplicationState}>,
  errorKey: ErrorKey
) => {
  try {
    return await promiseFn();
  } catch (error) {
    Toast.error({
      title: i18n.t(`Error.${errorKey}`),
      buttons: [i18n.t("Error.retry")],
      firstButtonOnClick: () => dispatch(action()),
    });
    throw error;
  }
};
