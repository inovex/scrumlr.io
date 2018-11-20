import * as baseX from 'base-x';

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const bs58 = baseX(BASE58);

const KEY_CAPABILITIES = ['encrypt', 'decrypt'];

const ENCRYPTION_ALGORITHM: RsaHashedImportParams = {
  name: 'RSA-OAEP',
  hash: { name: 'SHA-256' }
};

const LOCAL_STORAGE_PUBLIC_KEY = 'publicKey';
const LOCAL_STORAGE_PRIVATE_KEY = 'privateKey';

function ab2str(buf: ArrayBuffer) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length); // 2 bytes for each char
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function base58ab2str(buf: ArrayBuffer) {
  return bs58.encode(new Buffer(buf));
}

function base56str2ar(str: string) {
  return new Uint8Array(bs58.decode(str));
}

export class Crypto {
  publicKey: CryptoKey;
  privateKey: CryptoKey;

  symmetricKey: CryptoKey;
  activated: boolean = false;

  // import or generate keypair
  async initKeypair() {
    const localPublicKey = localStorage.getItem(LOCAL_STORAGE_PUBLIC_KEY);
    const localPrivateKey = localStorage.getItem(LOCAL_STORAGE_PRIVATE_KEY);

    if (localPublicKey && localPrivateKey) {
      this.publicKey = await window.crypto.subtle.importKey(
        'spki',
        base56str2ar(localPublicKey),
        ENCRYPTION_ALGORITHM,
        true,
        ['encrypt']
      );
      this.privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        base56str2ar(localPrivateKey),
        ENCRYPTION_ALGORITHM,
        true,
        ['decrypt']
      );
    } else {
      const generatedKeyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 1024,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: { name: 'SHA-256' }
        },
        true,
        KEY_CAPABILITIES
      );

      this.publicKey = generatedKeyPair.publicKey;
      this.privateKey = generatedKeyPair.privateKey;

      localStorage.setItem(
        LOCAL_STORAGE_PUBLIC_KEY,
        base58ab2str(
          await window.crypto.subtle.exportKey('spki', this.publicKey)
        )
      );
      localStorage.setItem(
        LOCAL_STORAGE_PRIVATE_KEY,
        base58ab2str(
          await window.crypto.subtle.exportKey('pkcs8', this.privateKey)
        )
      );
    }
  }

  async initSymmetricKey() {
    this.symmetricKey = await window.crypto.subtle.generateKey(
      {
        name: 'AES-CBC',
        length: 256
      },
      true,
      KEY_CAPABILITIES
    );
  }

  async exportSymmetricKey(publicKey: string) {
    const importedPublicKey = await window.crypto.subtle.importKey(
      'spki',
      base56str2ar(publicKey),
      ENCRYPTION_ALGORITHM,
      true,
      ['encrypt']
    );
    const rawSymmetricKey = await window.crypto.subtle.exportKey(
      'raw',
      this.symmetricKey
    );
    return base58ab2str(
      await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        importedPublicKey,
        rawSymmetricKey
      )
    );
  }

  async importSymmetricKey(symmetricKey: string) {
    const symmtericKeyBuffer = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      this.privateKey,
      base56str2ar(symmetricKey)
    );
    this.symmetricKey = await window.crypto.subtle.importKey(
      'raw',
      symmtericKeyBuffer,
      { name: 'AES-CBC', length: 256 },
      true,
      KEY_CAPABILITIES
    );
  }

  setActive(active: boolean) {
    this.activated = active;
  }

  getPublicKey() {
    return localStorage.getItem(LOCAL_STORAGE_PUBLIC_KEY);
  }

  async encrypt(message: string, iv: string) {
    if (this.activated) {
      return bs58.encode(
        new Buffer(
          await window.crypto.subtle.encrypt(
            {
              name: 'AES-CBC',
              iv: base56str2ar(iv)
            },
            this.symmetricKey,
            str2ab(message)
          )
        )
      );
    }
    return message;
  }

  async decrypt(message: string, iv: string) {
    if (this.activated) {
      return ab2str(
        await window.crypto.subtle.decrypt(
          {
            name: 'AES-CBC',
            iv: base56str2ar(iv)
          },
          this.symmetricKey,
          base56str2ar(message)
        )
      );
    }
    return message;
  }

  async generateInitializationVector() {
    return base58ab2str(
      await window.crypto.getRandomValues(new Uint8Array(16)).buffer
    );
  }
}
