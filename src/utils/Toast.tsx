import {toast, ToastOptions} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../components/CustomToast/CustomToast.scss";
import {TOAST_TIMER_DEFAULT} from "constants/misc";
import {CustomToast} from "components/CustomToast/CustomToast";
import {ReactComponent as InfoIcon} from "assets/icon-info.svg"; // info-icon broken?
import {ReactComponent as SuccessIcon} from "assets/icon-success.svg"; // exchange to success-icon
import {ReactComponent as ErrorIcon} from "assets/icon-cancel.svg"; // exchange to error-icon ?

const toastConfig: ToastOptions = {
  position: "bottom-right",
  hideProgressBar: true,
  closeOnClick: true,
};

export type ToastTypes = "info" | "success" | "warning" | "error";

type Options = {
  title: string;
  message?: string;
  hintMessage?: string | undefined;
  hintOnClick?: (() => void) | undefined;
  buttons?: string[] | undefined;
  firstButtonOnClick?: (() => void) | undefined;
  secondButtonOnClick?: (() => void) | undefined;
  autoClose?: number | false;
  icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  type?: ToastTypes;
};

/**
 * Display success message via toast.
 *
 * @param content Success message.
 */
function success(options: Options) {
  const {
    title,
    message,
    hintMessage,
    hintOnClick,
    buttons,
    firstButtonOnClick,
    secondButtonOnClick,
    autoClose = TOAST_TIMER_DEFAULT,
    icon = SuccessIcon,
    type = "success",
  } = options;
  toast(
    <CustomToast
      title={title}
      message={message}
      hintMessage={hintMessage}
      hintOnClick={hintOnClick}
      buttons={buttons}
      firstButtonOnClick={firstButtonOnClick}
      secondButtonOnClick={secondButtonOnClick}
      icon={icon}
      type={type}
    />,
    {...toastConfig, autoClose}
  );
}

/**
 * Display error message via toast.
 *
 * @param content Error message.
 */
function error(options: Options) {
  const {title, message, hintMessage, hintOnClick, buttons, firstButtonOnClick, secondButtonOnClick, autoClose = TOAST_TIMER_DEFAULT, icon = ErrorIcon, type = "error"} = options;
  toast(
    <CustomToast
      title={title}
      message={message}
      hintMessage={hintMessage}
      hintOnClick={hintOnClick}
      buttons={buttons}
      firstButtonOnClick={firstButtonOnClick}
      secondButtonOnClick={secondButtonOnClick}
      icon={icon}
      type={type}
    />,
    {...toastConfig, autoClose}
  );
}

/**
 * Display info message via toast.
 *
 * @param content Info message.
 */
function info(options: Options) {
  const {title, message, hintMessage, hintOnClick, buttons, firstButtonOnClick, secondButtonOnClick, autoClose = TOAST_TIMER_DEFAULT, icon = InfoIcon, type = "info"} = options;
  toast(
    <CustomToast
      title={title}
      message={message}
      hintMessage={hintMessage}
      hintOnClick={hintOnClick}
      buttons={buttons}
      firstButtonOnClick={firstButtonOnClick}
      secondButtonOnClick={secondButtonOnClick}
      icon={icon}
      type={type}
    />,
    {...toastConfig, autoClose}
  );
}

export const Toast = {
  success,
  error,
  info,
};
