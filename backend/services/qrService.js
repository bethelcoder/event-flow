const crypto = require("crypto");

// Encryption key (store in env, must be 32 bytes for aes-256)
const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(process.env.QR_SECRET_KEY || "supersecretkey123")
  .digest();

// AES algorithm
const ALGORITHM = "aes-256-ctr";

// Encrypt data
const encryptData = (data) => {
  const iv = crypto.randomBytes(16); // Initialization vector
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let crypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  crypted += cipher.final("hex");
  // Return IV + encrypted data (needed for decryption)
  return iv.toString("hex") + ":" + crypted;
};

// Decrypt data
const decryptData = (encrypted) => {
  const [ivHex, crypted] = encrypted.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let dec = decipher.update(crypted, "hex", "utf8");
  dec += decipher.final("utf8");
  return JSON.parse(dec);
};

// Generate reference number
const generateRefNumber = (platformName, eventName) => {
  const plat = platformName.slice(0, 3).toUpperCase();
  const ev = eventName.slice(0, 3).toUpperCase();
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${plat}-${ev}-${randomPart}`;
};

module.exports = { encryptData, decryptData, generateRefNumber };
