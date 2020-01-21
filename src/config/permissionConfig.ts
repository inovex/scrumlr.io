import defaultTo from 'lodash/defaultTo';
import toBoolean from '../util/toBoolean';

export const permissionConfig = Object.freeze({
    allowAnonymousBoards: toBoolean(defaultTo(process.env.REACT_APP_ALLOW_ANONYMOUS_BOARDS, true))
});

export default permissionConfig;
