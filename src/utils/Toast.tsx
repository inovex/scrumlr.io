import {toast, ToastOptions} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../components/CustomToast/CustomToast.scss";
import {TOAST_TIMER_DEFAULT} from "constants/misc";
import {CustomToast} from "components/CustomToast/CustomToast";
import {ReactComponent as InfoIcon} from "assets/icon-info.svg";
import {ReactComponent as SuccessIcon} from "assets/icon-success.svg";
import {ReactComponent as ErrorIcon} from "assets/icon-cancel.svg";

const toastConfig: ToastOptions = {
  position: "bottom-right",
  hideProgressBar: true,
  closeOnClick: true,
};

export type ToastTypes = "info" | "success" | "error";

export type Options = {
  title: string;
  message?: string;
  hintMessage?: string;
  hintOnClick?: () => void;
  buttons?: string[];
  firstButtonOnClick?: () => void;
  secondButtonOnClick?: () => void;
  autoClose?: number | false;
  icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  iconName?: string;
  type?: ToastTypes;
};

/**
 * Displays a success toast notification.
 *
 * @param options An object containing options for the toast notification.
 * @param options.title The title of the toast notification.
 * @param options.message The message to display in the toast notification.
 * @param options.hintMessage An optional hint message to display in the toast notification.
 * @param options.hintOnClick An optional callback function to execute when the hint message/checkbox is clicked.
 * @param options.buttons An array of button-labels to display in the toast notification. (for e.g. ["Save", "Cancel"])
 * @param options.firstButtonOnClick An optional callback function to execute when the first button is clicked.
 * @param options.secondButtonOnClick An optional callback function to execute when the second button is clicked.
 * @param options.autoClose The time in milliseconds after which the toast notification should automatically close.
 * @param options.icon An optional icon to display in the toast notification.
 * @param options.iconName An optional icon Name. Needs to be set to a any different name than "success", "error", or "info" when an icon is passed aswell.
 * @param options.type The type of the toast notification. Can be "success", "error", or "info".
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
    iconName = "success",
    type = "success",
  } = options;
  return toast(
    <CustomToast
      title={title}
      message={message}
      hintMessage={hintMessage}
      hintOnClick={hintOnClick}
      buttons={buttons}
      firstButtonOnClick={firstButtonOnClick}
      secondButtonOnClick={secondButtonOnClick}
      icon={icon}
      iconName={iconName}
      type={type}
    />,
    {...toastConfig, autoClose}
  );
}

/**
 * Displays an error toast notification.
 *
 * @param options An object containing options for the toast notification.
 * @param options.title The title of the toast notification.
 * @param options.message The message to display in the toast notification.
 * @param options.hintMessage An optional hint message to display in the toast notification.
 * @param options.hintOnClick An optional callback function to execute when the hint message/checkbox is clicked.
 * @param options.buttons An array of button-labels to display in the toast notification. (for e.g. ["Save", "Cancel"])
 * @param options.firstButtonOnClick An optional callback function to execute when the first button is clicked.
 * @param options.secondButtonOnClick An optional callback function to execute when the second button is clicked.
 * @param options.autoClose The time in milliseconds after which the toast notification should automatically close.
 * @param options.icon An optional icon to display in the toast notification.
 * @param options.iconName An optional icon Name. Needs to be set to a any different name than "success", "error", or "info" when an icon is passed aswell.
 * @param options.type The type of the toast notification. Can be "success", "error", or "info".
 */
function error(options: Options) {
  const {
    title,
    message,
    hintMessage,
    hintOnClick,
    buttons,
    firstButtonOnClick,
    secondButtonOnClick,
    autoClose = TOAST_TIMER_DEFAULT,
    icon = ErrorIcon,
    iconName = "error",
    type = "error",
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
      iconName={iconName}
      type={type}
    />,
    {...toastConfig, autoClose}
  );
}

/**
 * Displays an info toast notification.
 *
 * @param options An object containing options for the toast notification.
 * @param options.title The title of the toast notification.
 * @param options.message The message to display in the toast notification.
 * @param options.hintMessage An optional hint message to display in the toast notification.
 * @param options.hintOnClick An optional callback function to execute when the hint message/checkbox is clicked.
 * @param options.buttons An array of button-labels to display in the toast notification. (for e.g. ["Save", "Cancel"])
 * @param options.firstButtonOnClick An optional callback function to execute when the first button is clicked.
 * @param options.secondButtonOnClick An optional callback function to execute when the second button is clicked.
 * @param options.autoClose The time in milliseconds after which the toast notification should automatically close.
 * @param options.icon An optional icon to display in the toast notification.
 * @param options.iconName An optional icon Name. Needs to be set to a any different name than "success", "error", or "info" when an icon is passed aswell.
 * @param options.type The type of the toast notification. Can be "success", "error", or "info".
 */
function info(options: Options) {
  const {
    title,
    message,
    hintMessage,
    hintOnClick,
    buttons,
    firstButtonOnClick,
    secondButtonOnClick,
    autoClose = TOAST_TIMER_DEFAULT,
    icon = InfoIcon,
    iconName = "info",
    type = "info",
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
      iconName={iconName}
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
