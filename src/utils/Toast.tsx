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

function success(text: string) {
    toast.success(text, toastConfig);
}

function error(text: string) {
    toast.error(text, toastConfig);
}