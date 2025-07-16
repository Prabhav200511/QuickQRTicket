const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (to, otp) => {
  const mailOptions = {
    from: `"QuickTicket Support" <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'Your OTP for QuickTicket',
    text: `Your OTP is: ${otp}`,
    html: `<p>Your OTP is: <b>${otp}</b>. It is valid for 5 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOTP;
