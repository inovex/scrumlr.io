export class PublicKeyCrypto {
  readonly publicKey: CryptoKey;

  readonly privateKey: CryptoKey;

  constructor(publicKey: CryptoKey, privateKey: CryptoKey) {
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  encrypt = async (data: any) =>
    window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      this.publicKey,
      data
    );

  decrypt = async (data: any) =>
    window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      this.privateKey,
      data
    );
}

export default PublicKeyCrypto;
