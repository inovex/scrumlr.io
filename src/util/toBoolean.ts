import isBoolean from 'lodash/isBoolean';

const truthy = /^\s*(true|yes|1|on)\s*$/i;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toBoolean = (val: any) => {
  if (isBoolean(val)) {
    return val;
  }
  return truthy.test(val) && !!val;
};

export default toBoolean;
