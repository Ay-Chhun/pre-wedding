module.exports = async (req, res) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return res.status(400).send(`
        <h1>❌ ERROR: Missing Token</h1>
        <p>Your TELEGRAM_BOT_TOKEN is not configured in Vercel.</p>
        <p>Go to your Vercel Dashboard -> Settings -> Environment Variables, add TELEGRAM_BOT_TOKEN, and then trigger a new deployment!</p>
      `);
    }

    const webhookUrl = 'https://pre-wedding-six.vercel.app/api/bot';
    const telegramApi = `https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`;

    const response = await fetch(telegramApi);
    const data = await response.json();

    if (response.ok && data.ok) {
      return res.status(200).send(`
        <h1>✅ SUCCESS!</h1>
        <p>Telegram Webhook has been permanently connected to your Vercel app!</p>
        <p>Your bot is now actively listening to commands. Go completely test the <b>/start</b> command in Telegram now!</p>
        <br/><small>Webhook URL configured: ${webhookUrl}</small>
      `);
    } else {
      return res.status(500).json({ error: "Telegram API rejected the webhook", details: data });
    }
  } catch (error) {
    console.error("Setup Error:", error);
    return res.status(500).send("Internal Server Error: " + error.message);
  }
};
