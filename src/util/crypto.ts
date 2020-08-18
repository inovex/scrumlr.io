import * as baseX from 'base-x';
import { TextDecoder, TextEncoder } from 'text-encoding-utf-8';
import * as crypto from 'crypto';

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const bs58 = baseX(BASE58);

const SALT_BUFFER = str2ab('e85c53e7f119d41fd7895cdc9d7bb9dd');

const KEY_CAPABILITIES = ['encrypt', 'decrypt'];

const ENCRYPTION_ALGORITHM: RsaHashedImportParams = {
  name: 'RSA-OAEP',
  hash: { name: 'SHA-256' }
};

const LOCAL_STORAGE_PUBLIC_KEY = 'publicKey';
const LOCAL_STORAGE_PRIVATE_KEY = 'privateKey';

function ab2str(buf: ArrayBuffer) {
  return TextDecoder('utf-8').decode(buf);
}

function str2ab(str: string) {
  return TextEncoder('utf-8').encode(str);
}

function base58ab2str(buf: ArrayBuffer) {
  return bs58.encode(new Buffer(buf));
}

function base58str2ar(str: string) {
  return new Uint8Array(bs58.decode(str));
}

export const hash = async (text: string) => {
  return bs58.encode(
    new Buffer(await window.crypto.subtle.digest('SHA-256', str2ab(text)))
  );
};

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
        base58str2ar(localPublicKey),
        ENCRYPTION_ALGORITHM,
        true,
        ['encrypt']
      );
      this.privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        base58str2ar(localPrivateKey),
        ENCRYPTION_ALGORITHM,
        true,
        ['decrypt']
      );
    } else {
      const generatedKeyPair = await window.crypto.subtle.generateKey(
        {
          ...ENCRYPTION_ALGORITHM,
          modulusLength: 1024,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01])
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
      base58str2ar(publicKey),
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
        ENCRYPTION_ALGORITHM,
        importedPublicKey,
        rawSymmetricKey
      )
    );
  }

  async importSymmetricKey(symmetricKey: string) {
    const symmtericKeyBuffer = await window.crypto.subtle.decrypt(
      ENCRYPTION_ALGORITHM,
      this.privateKey,
      base58str2ar(symmetricKey)
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
              iv: base58str2ar(iv)
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
            iv: base58str2ar(iv)
          },
          this.symmetricKey,
          base58str2ar(message)
        )
      );
    }
    return message;
  }

  // Returns string 'publicKey_encryptedPrivateKey_iv'
  async encryptCredentials(password: string, iv: string) {
    this.initKeypair();

    const key = await this.createKey(password);

    // Wrap local private key with the secure symmetric key protected by the password
    return window.crypto.subtle
      .wrapKey('pkcs8', this.privateKey, key, {
        name: 'AES-CBC',
        iv: base58str2ar(iv)
      } as AesCbcParams)
      .then(
        encryptedKey =>
          this.getPublicKey() + '_' + base58ab2str(encryptedKey) + '_' + iv
      );
  }

  // Credentials have following format: 'publicKey_encryptedPrivateKey_iv'
  async decryptCredentials(password: string, credentials: string) {
    const [publicKey, privateKeyEnc, iv] = credentials.split('_');

    const unwrapKey = await this.createKey(password);

    this.privateKey = await window.crypto.subtle.unwrapKey(
      'pkcs8',
      base58str2ar(privateKeyEnc),
      unwrapKey,
      {
        name: 'AES-CBC',
        iv: base58str2ar(iv)
      } as AesCbcParams,
      ENCRYPTION_ALGORITHM,
      true,
      ['decrypt']
    );

    this.publicKey = await window.crypto.subtle.importKey(
      'spki',
      base58str2ar(publicKey),
      ENCRYPTION_ALGORITHM,
      true,
      ['encrypt']
    );

    // Save new keys in local storage
    localStorage.setItem(
      LOCAL_STORAGE_PUBLIC_KEY,
      base58ab2str(await window.crypto.subtle.exportKey('spki', this.publicKey))
    );
    localStorage.setItem(
      LOCAL_STORAGE_PRIVATE_KEY,
      base58ab2str(
        await window.crypto.subtle.exportKey('pkcs8', this.privateKey)
      )
    );
  }

  // derive secure key from an alphanumeric string: https://dev.to/halan/4-ways-of-symmetric-cryptography-and-javascript-how-to-aes-with-javascript-3o1b
  createKey = (from: string) => {
    // First, import password as a CryptoKey material
    return (
      window.crypto.subtle
        .importKey(
          'raw',
          new TextEncoder().encode(from),
          { name: 'PBKDF2', hash: 'SHA-256' },
          false,
          ['deriveBits', 'deriveKey']
        )
        //Second, derive a secure key from key material
        .then(keyMaterial =>
          window.crypto.subtle.deriveKey(
            {
              name: 'PBKDF2',
              salt: SALT_BUFFER,
              iterations: 1000,
              hash: { name: 'SHA-256' }
            },
            keyMaterial,
            {
              name: 'AES-CBC',
              length: 256 //can be  128, 192, or 256
            },
            false,
            ['wrapKey', 'unwrapKey']
          )
        )
    );
  };

  md5hash = (contents: string) =>
    crypto
      .createHash('md5')
      .update(contents)
      .digest('hex');

  async generateInitializationVector() {
    return base58ab2str(
      await window.crypto.getRandomValues(new Uint8Array(16)).buffer
    );
  }
}
