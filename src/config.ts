let httpProtocol = "https:";
let websocketProtocol = "wss:";

if (window.location.protocol === "http:") {
  httpProtocol = "http:";
  websocketProtocol = "ws:";
}

export const SERVER_HTTP_URL = process.env.REACT_APP_SERVER_HTTP_URL || `${window.location.origin.replace(window.location.protocol, httpProtocol)}/api`;
export const SERVER_WEBSOCKET_URL = process.env.REACT_APP_SERVER_WEBSOCKET_URL || `${window.location.origin.replace(window.location.protocol, websocketProtocol)}/api`;
