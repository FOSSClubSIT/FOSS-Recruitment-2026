// Cloudflare Worker: Telegram Webhook -> GitHub Actions Bridge
export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Academic Assistant Webhook is Running!", { status: 200 });
    }

    try {
      const payload = await request.json();
      const message = payload.message || payload.edited_message;
      if (!message || !message.text) {
        return new Response("OK", { status: 200 });
      }

      const chatId = message.chat.id.toString();
      const text = message.text.trim().toLowerCase();

      // Configs loaded securely from Cloudflare Worker environment variables / secrets
      const allowedChatId = (env.ALLOWED_CHAT_ID || "").toString().trim().replace(/['"\s]/g, "");
      const botToken = (env.TELEGRAM_BOT_TOKEN || "").toString().trim();
      const githubRepo = (env.GITHUB_REPO || "").toString().trim();
      const githubPat = (env.GITHUB_PAT || "").toString().trim();

      if (!allowedChatId || !botToken || !githubRepo || !githubPat) {
        console.error("Missing required environment variables in Cloudflare Worker.");
        return new Response("Configuration Error: Missing environment secrets", { status: 500 });
      }

      // Security check: Only respond to YOUR verified Telegram Chat ID
      if (chatId !== allowedChatId) {
        return new Response("Unauthorized", { status: 403 });
      }

      // Recognized triggers: "yo", "/now", "update", "tasks", etc.
      const triggers = ["yo", "/now", "/check", "/update", "update", "tasks", "status", "hey", "hi"];
      const isTrigger = triggers.includes(text) || text.startsWith("/") || text.includes("update") || text.includes("task");

      if (isTrigger) {
        // 1. Instant acknowledgment back to Telegram
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "🔍 <i>Yo, checking for updates, hol' on.</i>",
            parse_mode: "HTML"
          })
        });

        // 2. Dispatch GitHub Actions cloud workflow with force override
        const ghResponse = await fetch(`https://api.github.com/repos/${githubRepo}/dispatches`, {
          method: "POST",
          headers: {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": `token ${githubPat}`,
            "User-Agent": "Cloudflare-Worker-Academic-Bot"
          },
          body: JSON.stringify({
            event_type: "telegram_override"
          })
        });

        if (!ghResponse.ok) {
          const errorText = await ghResponse.text();
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `⚠️ <b>Error triggering GitHub:</b> ${errorText}`,
              parse_mode: "HTML"
            })
          });
        }
      }

      return new Response("OK", { status: 200 });
    } catch (err) {
      return new Response(`Error: ${err.message}`, { status: 500 });
    }
  },

  // High-precision Cloudflare Cron Trigger (Fires exactly on time: 8:00 AM & 8:00 PM IST)
  async scheduled(controller, env, ctx) {
    try {
      const githubRepo = (env.GITHUB_REPO || "").toString().trim();
      const githubPat = (env.GITHUB_PAT || "").toString().trim();

      if (!githubRepo || !githubPat) {
        console.error("[Cron Trigger] Missing GITHUB_REPO or GITHUB_PAT in Cloudflare Worker environment.");
        return;
      }

      console.log(`[Cron Trigger] Dispatching scheduled academic briefing for ${githubRepo}...`);

      const ghResponse = await fetch(`https://api.github.com/repos/${githubRepo}/dispatches`, {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github.v3+json",
          "Authorization": `token ${githubPat}`,
          "User-Agent": "Cloudflare-Worker-Academic-Bot"
        },
        body: JSON.stringify({
          event_type: "scheduled_run"
        })
      });

      console.log(`[Cron Trigger] GitHub Dispatch Response: ${ghResponse.status}`);
    } catch (err) {
      console.error(`[Cron Trigger] Failed to dispatch workflow: ${err.message}`);
    }
  }
};
