const https = require('https');

exports.handler = async (event) => {
  // Only allow POST requests for the webhook (from Telegram)
  if (event.httpMethod !== 'POST') {
    return { statusCode: 200, body: 'Bot Backend is perfectly running!' };
  }

  try {
    const body = JSON.parse(event.body);
    const message = body.message;

    // Check if the user sent a message and if it is exactly "/start"
    if (message && message.text === '/start') {
      const chatId = message.chat.id;

      // ==========================================
      // TODO: REPLACE THESE TWO LINES WITH YOUR DETAILS
      const botToken = '8591598280:AAHU-V7S3kGK0rERFRSRM_t42JrgOIO9cKw';
      const webAppUrl = 'https://pre-wedding-six.vercel.app'; // e.g. https://your-wedding.netlify.app
      // ==========================================

      const replyData = JSON.stringify({
        chat_id: chatId,
        text: 'សួស្តី! សូមស្វាគមន៍មកកាន់កម្មវិធីអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ សូមចុចប៊ូតុង "💌 បើកធៀបមក" ខាងក្រោមដើម្បីមើលធៀបអញ្ជើញ។',
        reply_markup: {
          inline_keyboard: [
            [{ text: "💌 បើកធៀបមក", web_app: { url: webAppUrl } }]
          ]
        }
      });

      // Send the beautifully formatted reply back to Telegram API
      await new Promise((resolve, reject) => {
        const req = https.request(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(replyData)
          }
        }, (res) => {
          resolve();
        });

        req.on('error', (e) => reject(e));
        req.write(replyData);
        req.end();
      });
    }

    return { statusCode: 200, body: 'OK' }; // Tell Telegram we got the message
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};
