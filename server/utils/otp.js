// utils/otp.js
const bcrypt = require('bcryptjs');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

async function hashOtp(otp) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
}

async function compareOtp(plainOtp, hashedOtp) {
  return bcrypt.compare(plainOtp, hashedOtp);
}

module.exports = { generateOtp, hashOtp, compareOtp };
