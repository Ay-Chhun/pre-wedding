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
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const webAppUrl = 'https://pre-wedding-six.vercel.app'; // e.g. https://your-wedding.netlify.app
      // ==========================================

      const replyData = JSON.stringify({
        chat_id: chatId,
        text: 'ជំរាបសួរ! 🌸 សូមស្វាគមន៍មកកាន់ចំណងដៃស្នេហា និងថ្ងៃពិសេសរបស់យើងខ្ញុំ ឈុន ផ្តើមវាសនាជាមួយ ម៉ីលិញ។ 💍\n\nវត្តមាន និងការជូនពររបស់លោកអ្នក គឺជាកិត្តិយសដ៏វិសេសវិសាលបំផុតសម្រាប់គ្រួសារយើង។ ✨\n\nសូមអញ្ជើញចុចប៊ូតុងខាងក្រោម ដើម្បីបើកមើលកាតអញ្ជើញ និងព័ត៌មានលម្អិតនៃកម្មវិធីសិរីមង្គលអាពាហ៍ពិពាហ៍របស់យើង។ 💌👇',
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
