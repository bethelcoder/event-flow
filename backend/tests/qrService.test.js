const { encryptData, decryptData, generateRefNumber } = require('../services/qrService');

describe('qrService', () => {
  it('encryptData and decryptData should work', () => {
    const data = { email: 'test@test.com', refNumber: 'REF123' };
    const encrypted = encryptData(data);
    expect(typeof encrypted).toBe('string');
    const decrypted = decryptData(encrypted);
    expect(decrypted).toEqual(data);
  });

  it('decryptData should throw on invalid input', () => {
    expect(() => decryptData('invalid')).toThrow();
  });

  it('generateRefNumber should return formatted string', () => {
    const ref = generateRefNumber('Event Flow', 'Techno AI Conference - 2025');
    expect(ref).toMatch(/^EVE-TEC-[A-F0-9]{8}$/);
  });
});
