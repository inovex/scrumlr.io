import {toast, ToastOptions} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {ReactNode} from "react";
import {TOAST_TIMER_DEFAULT} from "constants/misc";
import {CustomToast} from "components/CustomToast/CustomToast";

const toastConfig: ToastOptions = {
  position: "bottom-right",
  hideProgressBar: true,
  closeOnClick: true,
  autoClose: false,
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
function info(content: ReactNode, autoClose: number | false = TOAST_TIMER_DEFAULT) {
  toast.info(<CustomToast />, {...toastConfig});
}

export const Toast = {
  success,
  error,
  info,
};
