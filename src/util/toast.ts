import { toast as reactToastify } from 'react-toastify';

export const toast = {
    error: (message: string) => {
        reactToastify(message, { type: 'error' });
    },

    info: (message: string) => {
        reactToastify(message, { type: 'info' });
    }
};

export default toast;
