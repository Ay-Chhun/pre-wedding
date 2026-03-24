module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { user, guestName } = req.body;
    
    // Tracking Bot configuration (from Environment Variables)
    const trackingBotToken = process.env.TRACKING_BOT_TOKEN;
    const trackingChatId = process.env.TRACKING_CHAT_ID;

    if (!trackingBotToken || !trackingChatId) {
      console.error("TRACKING_BOT_TOKEN or TRACKING_CHAT_ID is missing in Environment Variables");
      // Still return 200 so the frontend doesn't show an error
      return res.status(200).send('Tracking omitted: Missing config');
    }

    // Format the tracking message
    let messageText = `🚀 *Mini App Launched!*\n\n`;
    
    if (guestName) {
      messageText += `👤 *Guest:* ${guestName}\n`;
    }
    
    if (user) {
      messageText += `🆔 *User ID:* \`${user.id}\`\n`;
      messageText += `📛 *Name:* ${user.first_name}${user.last_name ? ' ' + user.last_name : ''}\n`;
      if (user.username) {
        messageText += `👤 *Username:* @${user.username}\n`;
      }
      if (user.language_code) {
        messageText += `🌐 *Language:* ${user.language_code}\n`;
      }
    } else {
      messageText += `👤 *User:* Unknown (Launched outside Telegram?)\n`;
    }

    messageText += `⏰ *Time:* ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })} (ICT)\n`;

    // Send to Telegram Tracking Bot
    const result = await fetch(`https://api.telegram.org/bot${trackingBotToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: trackingChatId,
        text: messageText,
        parse_mode: 'Markdown'
      })
    });

    if (!result.ok) {
      const errorText = await result.text();
      console.error("Tracking API Error:", errorText);
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error("Server Error in Tracking:", error);
    return res.status(500).send('Internal Server Error');
  }
};
