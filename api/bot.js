module.exports = async (req, res) => {
  // Only allow POST requests for the webhook (from Telegram)
  if (req.method !== 'POST') {
    return res.status(200).send('Vercel Bot Backend is perfectly running!');
  }

  try {
    // Vercel automatically parses the JSON body into req.body
    const message = req.body?.message;

    // Check if the user sent a message and if it is exactly "/start"
    if (message && message.text === '/start') {
      const chatId = message.chat.id;
      
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        console.error("TELEGRAM_BOT_TOKEN is missing in Environment Variables");
        // We still return 200 so Telegram stops retrying
        return res.status(200).send('OK but token missing');
      }

      const webAppUrl = 'https://pre-wedding-six.vercel.app';

      const replyData = JSON.stringify({
        chat_id: chatId,
        text: 'ក្នុងសិរីសួស្ដីជ័យមង្គលដ៏ថ្លៃថ្លា នៃពិធីអាពាហ៍ពិពាហ៍របស់ពួកយើង ឈុន និង ម៉ីលិញ សូមគោរពជំរាបសួរលោកអ្នក! 🌸 ទីបំផុតថ្ងៃពិសេសដែលយើងរងចាំ បានមកដល់ហើយ! ✨ មកចូលរួមញ៉ាំការ និងរាំលេងកម្សាន្តឱ្យសប្បាយទាំងអស់គ្នាណា! 💖🥂\n\nសូមចុចប៊ូតុងខាងក្រោម ដើម្បីទស្សនាធៀបការ! 💌💍',
        reply_markup: {
          inline_keyboard: [
            [{ text: "💌 បើកធៀបមក", web_app: { url: webAppUrl } }]
          ]
        }
      });

      // Send the beautifully formatted reply back to Telegram API using modern fetch
      const result = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: replyData
      });
      
      if (!result.ok) {
        const errorText = await result.text();
        console.error("Telegram API Error:", errorText);
      }
    }

    return res.status(200).send('OK'); // Tell Telegram we got the message
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).send('Internal Server Error');
  }
};
