import {TextDecoder, TextEncoder} from "text-encoding-utf-8";
import {encode, decode} from "micro-base58";

export const arrayBufferToString = (buffer: ArrayBuffer) => TextDecoder("utf-8").decode(buffer);

export const stringToArrayBuffer = (str: string) => TextEncoder("utf-8").encode(str);

export const base58arrayBufferToString = (buf: ArrayBuffer) => encode(new Uint8Array(buf));

export const base58stringToArrayBuffer = (str: string) => new Uint8Array(decode(str));
