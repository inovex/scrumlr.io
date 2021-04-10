import {arrayBufferToString, base58arrayBufferToString, base58stringToArrayBuffer, stringToArrayBuffer} from "./encodingUtils";

export const initializeSymmetricKey = async () => window.crypto.subtle.generateKey(
    {
      name: "AES-CBC",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

export const newInitVector = async () => base58arrayBufferToString(await window.crypto.getRandomValues(new Uint8Array(16)).buffer);

export class SymmetricKeyCrypto {
  readonly key: CryptoKey;

  constructor(key: CryptoKey) {
    this.key = key;
  }

  encrypt = async (message: string, iv: string) => base58arrayBufferToString(
      new Buffer(
        await window.crypto.subtle.encrypt(
          {
            name: "AES-CBC",
            iv: base58stringToArrayBuffer(iv),
          },
          this.key,
          stringToArrayBuffer(message)
        )
      )
    );

  decrypt = async (message: string, iv: string) => arrayBufferToString(
      await window.crypto.subtle.decrypt(
        {
          name: "AES-CBC",
          iv: base58stringToArrayBuffer(iv),
        },
        this.key,
        base58stringToArrayBuffer(message)
      )
    );
}
