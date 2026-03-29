// api/bot.js - Telegram Bot Webhook for Wedding Invitation
// Handles the /start <value> command and replies with a button to open the Mini App

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Only POST requests allowed');
    }

    const { message } = req.body;

    // We only care about /start command
    if (message && message.text && message.text.startsWith('/start')) {
        const chatId = message.chat.id;
        const text = message.text;

        // 1. Extract the deep link parameter (the hashed ID)
        // Format: /start <value>
        const parts = text.split(' ');
        const startParam = parts.length > 1 ? parts[1] : '';

        // 2. Prepare the Telegram API request
        // Replace with your real BOT_TOKEN (you should set this in Vercel Environment Variables)
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

        // Link to your Mini App (replace with your Bot username & App short name)
        const appUrl = `https://t.me/CLWeddingBot/invite?startapp=${startParam}`;

        const payload = {
            chat_id: chatId,
            text: "🎉 សូមស្វាគមន៍មកកាន់ពិធីមង្គលការរបស់ពួកយើង!\n\nវត្តមានរបស់អ្នកគឺជាកិត្តិយសដ៏ធំបំផុតសម្រាប់ពួកយើង។ សូមចុចប៊ូតុងខាងក្រោមដើម្បីមើលលិខិតអញ្ជើញរបស់អ្នក៖",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "💌 បើកលិខិតអញ្ជើញ",
                            url: appUrl
                        }
                    ]
                ]
            }
        };

        // 3. Send the response via Telegram API
        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.error('Error sending Telegram message:', error);
        }
    }

    // Always 200 OK for Telegram
    return res.status(200).send('OK');
}
