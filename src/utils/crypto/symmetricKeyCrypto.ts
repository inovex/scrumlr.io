import {arrayBufferToString, base58arrayBufferToString, base58stringToArrayBuffer, stringToArrayBuffer} from "./encodingUtils";
import PublicKeyCrypto from "./publicKeyCrypto";

export const initializeNewSymmetricKey = async () =>
  window.crypto.subtle.generateKey(
    {
      name: "AES-CBC",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

export const importSymmetricKey = async (publicKeyCrypto: PublicKeyCrypto, key: string) => {
  const symmetricKeyBuffer = await publicKeyCrypto.decrypt(key);
  return new SymmetricKeyCrypto(await window.crypto.subtle.importKey("raw", symmetricKeyBuffer, {name: "AES-CBC", length: 256}, true, ["encrypt", "decrypt"]));
};

export const newInitVector = async () => base58arrayBufferToString(await window.crypto.getRandomValues(new Uint8Array(16)).buffer);

export class SymmetricKeyCrypto {
  readonly key: CryptoKey;

  constructor(key: CryptoKey) {
    this.key = key;
  }

  encrypt = async (message: string, iv: string) =>
    base58arrayBufferToString(
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

  decrypt = async (message: string, iv: string) =>
    arrayBufferToString(
      await window.crypto.subtle.decrypt(
        {
          name: "AES-CBC",
          iv: base58stringToArrayBuffer(iv),
        },
        this.key,
        base58stringToArrayBuffer(message)
      )
    );

  export = async (publicKey: string) => {
    const importedPublicKey = await window.crypto.subtle.importKey(
      "spki",
      base58stringToArrayBuffer(publicKey),
      {
        name: "RSA-OAEP",
        hash: {name: "SHA-256"},
      },
      true,
      ["encrypt"]
    );
    const rawSymmetricKey = await window.crypto.subtle.exportKey("raw", this.key);
    return base58arrayBufferToString(
      await window.crypto.subtle.encrypt(
        {
          name: "RSA-OAEP",
        },
        importedPublicKey,
        rawSymmetricKey
      )
    );
  };
}
