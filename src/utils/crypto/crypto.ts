export interface JsonWebKeySet {
  keys: JsonWebKey[];
}

const ENCRYPTION_ALGORITHM: RsaHashedImportParams = {
  name: "RSA-OAEP",
  hash: {name: "SHA-256"},
};

const onStore = (fn_: (store: IDBObjectStore) => void) => {
  const {indexedDB} = window;
  const databaseHandler = indexedDB.open("ScrumlrDB", 1);

  databaseHandler.onupgradeneeded = () => {
    const db = databaseHandler.result;
    db.createObjectStore("ScrumlrObjectStore", {keyPath: "id"});
  };

  databaseHandler.onsuccess = () => {
    const db = databaseHandler.result;
    const tx = db.transaction("ScrumlrObjectStore", "readwrite");
    const store = tx.objectStore("ScrumlrObjectStore");

    fn_(store);

    tx.oncomplete = function () {
      db.close();
    };
  };
};

/**
 * Generates a new Crypto keypair.
 *
 * @param extractable flag which indicates whether the keypair is extractable
 *
 * @return the generated crypto keypair
 */
const generateKeypair = async (extractable = false) =>
  window.crypto.subtle.generateKey(
    {
      ...ENCRYPTION_ALGORITHM,
      modulusLength: 2048, // can be 1024, 2048, or 4096
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    },
    extractable,
    ["encrypt", "decrypt"]
  );

/**
 * Exports the specified keypair in the JWKS format.
 *
 * @param keypair the keypair to export
 *
 * @return the keypair in JWKS format
 */
const exportKeypair = async (keypair: CryptoKeyPair): Promise<JsonWebKeySet> => {
  const publicKey = await window.crypto.subtle.exportKey("jwk", keypair.publicKey);
  const privateKey = await window.crypto.subtle.exportKey("jwk", keypair.privateKey);

  return {
    keys: [publicKey, privateKey],
  };
};

/**
 * Returns the crypto key by the specified json web key and key operation.
 *
 * @param jwks the JWKS
 * @param keyOperation the key operation that identifies the crypto key to extract
 *
 * @return the crypto key instance for the specified parameters
 */
const importKey = async ({keys}: JsonWebKeySet, keyOperation: "decrypt" | "encrypt") => {
  const keyData = keys.find((key) => key.key_ops && key.key_ops.indexOf(keyOperation) >= 0);
  if (keyData) {
    return await window.crypto.subtle.importKey("jwk", keyData, ENCRYPTION_ALGORITHM, false, [keyOperation]);
  }
  throw new Error("JWK does not contain private key");
};

/**
 * Returns the private key from the specified JWK.
 *
 * @param jwks the JWKS to import
 *
 * @return the private crypto key
 */
const importPrivateKey = async (jwks: JsonWebKeySet) => importKey(jwks, "decrypt");

/**
 * Returns the public key from the specified JWK.
 *
 * @param jwks the JWKS to import
 *
 * @return the public crypto key
 */
const importPublicKey = async (jwks: JsonWebKeySet) => importKey(jwks, "encrypt");

let publicKey: CryptoKey | null = null;
let privateKey: CryptoKey | null = null;

const importKeypair = async (jwk: JsonWebKeySet) => {
  publicKey = await importPublicKey(jwk);
  privateKey = await importPrivateKey(jwk);

  onStore((store) => {
    store.put({id: 1, publicKey, privateKey});
  });
};

export const initializeNewKeypair = async () => {
  const keypair = await generateKeypair(true);
  const jwk = await exportKeypair(keypair);
  await importKeypair(jwk);
};

export const loadKeypair = async () =>
  new Promise((resolve, reject) => {
    if (!publicKey && !privateKey) {
      onStore((store) => {
        const keyData = store.get(1);
        keyData.onsuccess = () => {
          publicKey = keyData.result.publicKey;
          privateKey = keyData.result.privateKey;
          resolve(true);
        };
        keyData.onerror = () => {
          reject(false);
        };
      });
    }
    resolve(true);
  });

const encrypt = async (data: any) => {
  if (!publicKey) {
    throw new Error("Keypair not loaded yet");
  }
  return window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    data
  );
};

const decrypt = async (data: any) => {
  if (!privateKey) {
    throw new Error("Keypair not loaded yet");
  }
  return window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    data
  );
};

const test = async () => {
  await initializeNewKeypair();
  await loadKeypair();

  const encrypted = encrypt("test");
  const decrypted = decrypt(encrypted);

  return decrypted;
};

export default test;
