import Cookies from "js-cookie";

const getCookie = (name: string) => Cookies.get(name);
const getCookieBool = (name: string, fallback = true) => {
  const v = Cookies.get(name);
  return v !== undefined ? v.toLowerCase() === "true" : fallback;
};

let httpProtocol = "https:";
let websocketProtocol: "ws:" | "wss:" = "wss:";

if (typeof window !== "undefined" && window.location.protocol === "http:") {
  httpProtocol = "http:";
  websocketProtocol = "ws:";
}

export const SHOW_LEGAL_DOCUMENTS = getCookieBool("scrumlr__show-legal-documents", true);

export const SERVER_HTTP_URL =
  getCookie("scrumlr__server-url") || process.env.REACT_APP_SERVER_HTTP_URL || `${window.location.origin.replace(window.location.protocol, httpProtocol)}/api`;

export const SERVER_WEBSOCKET_URL =
  getCookie("scrumlr__websocket-url") || process.env.REACT_APP_SERVER_WEBSOCKET_URL || `${window.location.origin.replace(window.location.protocol, websocketProtocol)}/api`;

export const SERVER_WEBSOCKET_PROTOCOL = websocketProtocol;

export const ANALYTICS_DATA_DOMAIN = getCookie("scrumlr__analytics_data_domain");
export const ANALYTICS_SRC = getCookie("scrumlr__analytics_src");
export const CLARITY_ID = getCookie("scrumlr__clarity_id");

export type UnleashFrontendConfig = {
  url: string;
  clientKey: string;
  environment?: string;
  appName?: string;
};

export async function fetchUnleashConfig(): Promise<UnleashFrontendConfig | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch("/api/unleash-config", {
      credentials: "same-origin",
      headers: {Accept: "application/json"},
      signal: controller.signal,
    });
    if (res.status === 204) return null;
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<UnleashFrontendConfig>;
    if (!data?.url || !data?.clientKey) return null;
    data.url = data.url.replace(/\/$/, "");
    return data as UnleashFrontendConfig;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
