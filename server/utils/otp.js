const sendOTP = async (phone, otp) => {
  await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: { authorization: process.env.FAST2SMS_KEY },
    body: JSON.stringify({
      route: 'otp',
      variables_values: otp,
      numbers: phone,
      flash: 0,
    }),
  });
};

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

module.exports = { sendOTP, generateOTP };
