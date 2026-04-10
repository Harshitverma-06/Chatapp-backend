import dotenv from "dotenv";
dotenv.config();
import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";

const isProduction = process.env.NODE_ENV === "production";
// In development, avoid blocking local/server-to-server calls (e.g. Flask using python-requests),
// but still allow observing decisions.
const mode = isProduction ? "LIVE" : "DRY_RUN";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode }), // Protects from common attacks e.g. SQL injection

    detectBot({
      mode,
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        //"CATEGORY:MONITOR", /"/ Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    slidingWindow({
      mode,
      max: 60,
      interval: 60, 
    }),
  ],
});


export default aj