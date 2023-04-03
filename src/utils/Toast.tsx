import {toast, ToastItem, ToastOptions} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {ReactNode} from "react";
import {TOAST_TIMER_DEFAULT} from "constants/misc";
import "./Toast.scss";
// import { Actions } from "store/action";

const toastConfig: ToastOptions = {
  position: "bottom-right",
  hideProgressBar: true,
  closeOnClick: true,
};

/**
 * Display success message via toast.
 *
 * @param content Success message.
 */
function success(content: ReactNode, autoClose: number | false = TOAST_TIMER_DEFAULT) {
  toast.success(content, {...toastConfig, autoClose});
}

/**
 * Display error message via toast.
 *
 * @param content Error message.
 */
function error(content: ReactNode, autoClose: number | false = TOAST_TIMER_DEFAULT) {
  toast.error(content, {...toastConfig, autoClose});
}

/**
 * Display info message via toast.
 *
 * @param content Info message.
 */
function info(content: ReactNode, autoClose: number | false = TOAST_TIMER_DEFAULT, data?: {}) {
  toast(content, {...toastConfig, autoClose, data});
}

toast.onChange((payload: ToastItem) => {
  switch (payload.status) {
    case "added": // new toast added
      break;
    case "updated": // toast updated
      break;
    case "removed": // toast has been removed
      switch (
        payload.data.case // remove case distinction
      ) {
        case "deletedNote":
          payload.data.callback();
          break;
        case "unstackedNote":
          payload.data.callback();
      }
      break;
  }
});

export const Toast = {
  success,
  error,
  info,
};
