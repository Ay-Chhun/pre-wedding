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
      
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const webAppUrl = 'https://pre-wedding-six.vercel.app';

      const replyData = JSON.stringify({
        chat_id: chatId,
        text: 'សួស្ដី! ✨ ក្នុងថ្ងៃដ៏វិសេសវិសាលបំផុតនៃជីវិតរបស់ពួកយើង ឈុន និង ម៉ីលិញ មានកិត្តិយសយ៉ាងខ្លាំងក្នុងការគោរពអញ្ជើញលោកអ្នក។ 🌸 រាល់ពាក្យជូនពរ និងវត្តមានរបស់អ្នក គឺជាអត្ថន័យដ៏ធំបំផុតសម្រាប់ក្តីស្រលាញ់របស់ពួកយើង។ 💖\n\nសូមចុចប៊ូតុងខាងក្រោម ដើម្បីបើកធៀបអញ្ជើញ និងព័ត៌មានលម្អិត! 💌💍',
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
