import {base58arrayBufferToString, base58stringToArrayBuffer} from "./encodingUtils";

export class PublicKeyCrypto {
  readonly publicKey: CryptoKey;

  readonly privateKey: CryptoKey;

  constructor(publicKey: CryptoKey, privateKey: CryptoKey) {
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  decrypt = async (message: string) => window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      this.privateKey,
      base58stringToArrayBuffer(message)
    );

  getPublicKey = async () => base58arrayBufferToString(await window.crypto.subtle.exportKey("spki", this.publicKey));
}

export default PublicKeyCrypto;
