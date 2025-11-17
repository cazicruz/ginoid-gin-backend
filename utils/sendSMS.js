const twilio = require('twilio');

const sendSMS = async (phone, message) => {
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE,
    to: phone
  });
};

module.exports = sendSMS;