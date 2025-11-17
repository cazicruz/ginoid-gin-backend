const nodemailer = require('nodemailer');

const sendEmail = async (email, subject, text,html) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_PROVIDER,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  const mailOptions = {
    from: `"B-Classy App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    ...(html ? { html } : { text })
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

