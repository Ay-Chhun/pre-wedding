const https = require('https');

module.exports = async (req, res) => {
  // Only allow POST requests for the webhook (from Telegram)
  if (req.method !== 'POST') {
    return res.status(200).send('Vercel Bot Backend is perfectly running!');
  }

  try {
    // Vercel automatically parses the JSON body into req.body
    const message = req.body.message;

    // Check if the user sent a message and if it is exactly "/start"
    if (message && message.text === '/start') {
      const chatId = message.chat.id;
      
      const botToken = '8591598280:AAHU-V7S3kGK0rERFRSRM_t42JrgOIO9cKw';
      const webAppUrl = 'https://pre-wedding-six.vercel.app';

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
        const request = https.request(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(replyData)
          }
        }, (response) => {
          resolve();
        });
        
        request.on('error', (e) => reject(e));
        request.write(replyData);
        request.end();
      });
    }

    return res.status(200).send('OK'); // Tell Telegram we got the message
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};
