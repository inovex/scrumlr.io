const JSEncrypt: any = require('jsencrypt').default;

const ENCODING = 'latin1';

export interface Keypair {
  publicKey: string;
  privateKey: string;
}

export const generateKeypair = (keysize: number = 1024): Keypair => {
  const jsEncrypt = new JSEncrypt({
    default_key_size: keysize
  });

  const key = jsEncrypt.getKey();
  return {
    publicKey: key.getPublicKey(ENCODING),
    privateKey: key.getPrivateKey(ENCODING)
  };
};

export class Chiffre {
  private jsEncrypt: any;

  constructor(keypair: Keypair) {
    this.jsEncrypt = new JSEncrypt();
    this.jsEncrypt.setPublicKey(keypair.publicKey, ENCODING);
    this.jsEncrypt.setPrivateKey(keypair.privateKey, ENCODING);
  }

  public encrypt(message: string) {
    return this.jsEncrypt.encrypt(message);
  }

  public decrypt(message: string) {
    return this.jsEncrypt.decrypt(message);
  }
}
