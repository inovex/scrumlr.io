export const SERVER_HTTP_URL = process.env.REACT_APP_SERVER_HTTP_URL || `${window.location.origin.replace(window.location.protocol, "https:")}/api`;
export const SERVER_WEBSOCKET_URL = process.env.REACT_APP_SERVER_WEBSOCKET_URL || `${window.location.origin.replace(window.location.protocol, "wss:")}/api`;
