const crypto = require('crypto');
// const readline = require('readline');
// ✅ Shared password (replace with actual token/password)
const password = "India@2608"; // <-- 🔐 Replace this

// ✅ Custom payload
// const payload = {
//   transID: "1234567",
//   docType: 326,
//   docNumber: "JH0320070001227",
//   dob: "02-02-1988"
// };

// const plainText = JSON.stringify(payload);

/**
 * Encrypt data using AES-128-CBC with SHA-512 derived key and random IV
 */
const encrypt = (plainText, pass = password) => {
  var iv = crypto.randomBytes(16);
  const hash = crypto.createHash('sha512');
  const dataKey = hash.update(pass, 'utf-8');
  const genHash = dataKey.digest('hex');
  const key = genHash.substring(0, 16);
  const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key), iv);
  let requestData = cipher.update(plainText, 'utf-8', 'base64');
  requestData += cipher.final('base64') + ":" + new Buffer(iv).toString('base64');
  return requestData;
}

/**
 * Decrypt data using AES-128-CBC with SHA-512 derived key and provided IV
 */
const decrypt = (encText, pass = password) => {
  var m = crypto.createHash('sha512');
  var datakey = m.update(pass, 'utf-8');
  var genHash = datakey.digest('hex');
  var key = genHash.substring(0, 16);
  var result = encText.split(":");
  var iv = Buffer.from(result[1], 'base64');
  var decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(key), iv);
  var decoded = decipher.update(result[0], 'base64', 'utf8');
  decoded += decipher.final('utf8');
  return decoded;
}

module.exports = {
  encrypt,
  decrypt
}

// ✅ Encrypt and show output
  // const encrypted = encrypt(plainText, password);
  // console.log("🔐 Encrypted (Base64 + IV):");
  // console.log(encrypted);


// // 🔄 Ask user if they want to decrypt
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// rl.question("\nDo you want to decrypt a value? (yes/no): ", (answer) => {
//   if (answer.toLowerCase() === "yes") {
//     rl.question("Enter the encrypted string (ciphertext:IV): ", (inputEncrypted) => {
//       try {
//         const decrypted = decrypt(inputEncrypted, password);
//         console.log("\n🔓 Decrypted Output:");
//         console.log(decrypted);
//       } catch (err) {
//         console.error("\n❌ Error during decryption:", err.message);
//       }
//       rl.close();
//     });
//   } else {
//     rl.close();
//   }
// });