const sendWhatsApp = async (to, message) => {
  const phone = to.startsWith('91') ? to : `91${to}`;
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: message },
      }),
    }
  );
  return res.json();
};

const getMediaUrl = async (mediaId) => {
  const res = await fetch(`https://graph.facebook.com/v19.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
  });
  const data = await res.json();
  return data.url;
};

const downloadMedia = async (mediaUrl) => {
  const res = await fetch(mediaUrl, {
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
  });
  return Buffer.from(await res.arrayBuffer());
};

module.exports = { sendWhatsApp, getMediaUrl, downloadMedia };
