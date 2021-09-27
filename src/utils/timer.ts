import {callAPI} from "api/callApi";

/**
 * Calculates the difference between the local browser time and the server
 * time in milliseconds.
 *
 * @returns a negative number if server is ahead, positive otherwise
 */
export const getBrowserServerTimeDifference = async () => {
  const serverTime: string = await callAPI("getServerTime", {});
  return Date.parse(new Date().toUTCString()) - Date.parse(serverTime);
};
