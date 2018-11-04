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
  private decriptionAllowed: boolean;

  constructor(keypair: { publicKey: string; privateKey?: string }) {
    this.jsEncrypt = new JSEncrypt();
    this.jsEncrypt.setPublicKey(keypair.publicKey, ENCODING);
    if (keypair.privateKey) {
      this.jsEncrypt.setPrivateKey(keypair.privateKey, ENCODING);
      this.decriptionAllowed = true;
    } else {
      this.decriptionAllowed = false;
    }
  }

  public encrypt(message: string) {
    return this.jsEncrypt.encrypt(message);
  }

  public decrypt(message: string) {
    if (this.decriptionAllowed) {
      return this.jsEncrypt.decrypt(message);
    }
    throw new Error('private key not set, decryption not available');
  }
}
