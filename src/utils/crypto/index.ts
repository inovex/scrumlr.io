import PublicKeyCrypto from "./publicKeyCrypto";

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
    return await window.crypto.subtle.importKey("jwk", keyData, ENCRYPTION_ALGORITHM, keyOperation === "encrypt", [keyOperation]);
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

export const importKeypair = async (jwks: JsonWebKeySet) => {
  const publicKey = await importPublicKey(jwks);
  const privateKey = await importPrivateKey(jwks);

  onStore((store) => {
    store.put({id: 1, publicKey, privateKey});
  });

  return new PublicKeyCrypto(publicKey, privateKey);
};

export const initializeNewKeypair = async () => {
  const extractableKeypair = await generateKeypair(true);
  const jwks = await exportKeypair(extractableKeypair);
  const keypair = await importKeypair(jwks);
  return {jwks, publicKeyCrypto: new PublicKeyCrypto(keypair.publicKey, keypair.privateKey)};
};

export const keypairExists = async () => Boolean(await loadKeypair());

export const loadKeypair = async () =>
  new Promise((resolve) => {
    onStore((store) => {
      const keyData = store.get(1);
      keyData.onsuccess = () => {
        const {publicKey} = keyData.result;
        const {privateKey} = keyData.result;
        resolve(new PublicKeyCrypto(publicKey, privateKey));
      };
      keyData.onerror = () => {
        resolve(undefined);
      };
    });
  });

export default {};
