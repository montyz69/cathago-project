const crypto = require("crypto");

//generate token
function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

//encryption
function caesarCipherEncrypt(text, shift) {
  return text
    .split("")
    .map((char) => {
      let code = char.charCodeAt(0);
      if (char >= "A" && char <= "Z")
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      if (char >= "a" && char <= "z")
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      return char;
    })
    .join("");
}

//decryption
function caesarCipherDecrypt(text, shift) {
  return caesarCipherEncrypt(text, 26 - (shift % 26));
}

//session storage
const sessionStorage = {};

module.exports = {
  generateToken,
  caesarCipherEncrypt,
  caesarCipherDecrypt,
  sessionStorage,
};
