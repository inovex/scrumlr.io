import { Chiffre, generateKeypair } from './encrypt';

describe('encrypt', () => {
  it('should generate a keypair with default keysize', () => {
    const keypair = generateKeypair();
    expect(keypair.publicKey).toBeDefined();
    expect(keypair.privateKey).toBeDefined();
  });

  it('should generate a keypair with specified key size', () => {
    const keypair = generateKeypair(512);
    expect(keypair.publicKey).toBeDefined();
    expect(keypair.privateKey).toBeDefined();
  });

  describe('Chiffre', () => {
    let chiffre: Chiffre;

    beforeEach(() => {
      const keypair = generateKeypair(128);
      chiffre = new Chiffre(keypair);
    });

    it('should encrypt a message', () => {
      const message = 'Test';
      const encryptedMessage = chiffre.encrypt(message);

      expect(encryptedMessage).not.toEqual(message);
    });

    it('should decrypt a message correctly', () => {
      const message = 'Test';
      const encryptedMessage = chiffre.encrypt(message);
      const decryptedMessage = chiffre.decrypt(encryptedMessage);

      expect(decryptedMessage).toEqual(message);
    });
  });
});
