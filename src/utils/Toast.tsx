import {toast, ToastOptions} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {ReactNode} from "react";
import {TOAST_TIMER_DEFAULT} from "constants/misc";
import {CustomToast} from "components/CustomToast/CustomToast";
import {ReactComponent as InfoIcon} from "assets/icon-delete.svg"; // info-icon broken?

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
};
/**
 * Display info message via toast.
 *
 * @param content Info message.
 */
function info(options: Options) {
  const {title, message, hintMessage, hintOnClick, buttons, firstButtonOnClick, secondButtonOnClick, autoClose = TOAST_TIMER_DEFAULT, icon = InfoIcon} = options;
  toast.info(
    <CustomToast
      title={title}
      message={message}
      hintMessage={hintMessage}
      hintOnClick={hintOnClick}
      buttons={buttons}
      firstButtonOnClick={firstButtonOnClick}
      secondButtonOnClick={secondButtonOnClick}
      icon={icon}
    />,
    {...toastConfig, autoClose}
  ); // .info/success/error = set different icons and colors?
}

export const Toast = {
  success,
  error,
  info,
};
