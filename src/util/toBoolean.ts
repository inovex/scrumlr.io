import isBoolean from 'lodash/isBoolean';

const falsy = /^(?:f(?:alse)?|no?|0+)$/i;
export const toBoolean = (val: any) => {
    if (isBoolean(val)) {
        return val;
    }
    return !falsy.test(val) && !!val;
};

export default toBoolean;
