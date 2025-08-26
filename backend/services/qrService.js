const crypto = require("crypto");

// Encryption key (store in env)
const ENCRYPTION_KEY = process.env.QR_SECRET_KEY || "supersecretkey123"; 
const ALGORITHM = "aes-256-ctr";

const encryptData = (data) => {
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let crypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
}

const decryptData = (encrypted) => {
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  let dec = decipher.update(encrypted, "hex", "utf8");
  dec += decipher.final("utf8");
  return JSON.parse(dec);
}

const generateRefNumber = (platformName, eventName) => {
  const plat = platformName.slice(0, 3).toUpperCase();
  const ev = eventName.slice(0, 3).toUpperCase();

  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${plat}-${ev}-${randomPart}`;
}



module.exports = { encryptData, decryptData, generateRefNumber };
