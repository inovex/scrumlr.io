import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {ToastOptions} from 'react-toastify/dist/types/index';

export const Toast = {
    success,
    error
};

const toastConfig: ToastOptions = {
    position: 'bottom-right',
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true
};

/**
 * Display success message via toast.
 * 
 * @param text Success message.
 */
function success(text: string) {
    toast.success(text, toastConfig);
}

/**
 * Display error message via toast.
 * 
 * @param text Error message.
 */
function error(text: string) {
    toast.error(text, toastConfig);
}