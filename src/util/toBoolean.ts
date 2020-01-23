import isBoolean from 'lodash/isBoolean';

const truthy = /^\s*(true|yes|1|on)\s*$/i;
export const toBoolean = (val: any) => {
    if (isBoolean(val)) {
        return val;
    }
    return truthy.test(val) && !!val;
};

export default toBoolean;
