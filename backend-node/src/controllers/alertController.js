import { LIVE_MARKET_SEEDS, shapeEvent } from "../services/seedService.js";
import { isEmailConfigured, sendAlertEmail } from "../services/emailService.js";

export async function sendCoinAlertEmail(req, res) {
  const coinId = req.body?.coinId;

  if (!coinId) {
    return res.status(400).json({ message: "coinId is required" });
  }

  const seed = LIVE_MARKET_SEEDS.find((item) => item._id === coinId);
  if (!seed) {
    return res.status(404).json({ message: "Live coin not found" });
  }

  if (!isEmailConfigured()) {
    return res.status(400).json({ message: "Email alerts are not configured on the server yet" });
  }

  const coin = await shapeEvent(seed);
  const recommendation = coin.alertRecommendation;

  const subject = `[Meme Buddy] ${coin.asset} ${recommendation.side} alert`;
  const text = [
    `Coin: ${coin.asset}`,
    `Action: ${recommendation.action}`,
    `Signal: ${coin.prediction}`,
    `Trend Score: ${coin.trendScore}/100`,
    `Confidence: ${coin.confidence}%`,
    `Recommendation: ${recommendation.summary}`,
    `Reason: ${recommendation.reason}`,
    `Verification: ${coin.verification?.classification || "Needs Human Review"}`,
    `Bot Risk: ${coin.verification?.botRiskScore ?? 0}/100`,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;background:#0b1020;color:#f5f7ff;padding:24px">
      <h2 style="margin-top:0">Meme Buddy Alert</h2>
      <p><strong>Coin:</strong> ${coin.asset}</p>
      <p><strong>Action:</strong> ${recommendation.action}</p>
      <p><strong>Signal:</strong> ${coin.prediction}</p>
      <p><strong>Trend Score:</strong> ${coin.trendScore}/100</p>
      <p><strong>Confidence:</strong> ${coin.confidence}%</p>
      <p><strong>Recommendation:</strong> ${recommendation.summary}</p>
      <p><strong>Reason:</strong> ${recommendation.reason}</p>
      <p><strong>Verification:</strong> ${coin.verification?.classification || "Needs Human Review"}</p>
      <p><strong>Bot Risk:</strong> ${coin.verification?.botRiskScore ?? 0}/100</p>
    </div>
  `;

  await sendAlertEmail({
    to: req.user.email,
    subject,
    text,
    html,
  });

  return res.json({
    message: `Alert email sent to ${req.user.email}`,
    recommendation,
  });
}
