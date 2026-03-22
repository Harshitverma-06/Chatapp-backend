import dotenv from "dotenv";
dotenv.config();
import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";


const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),//Protects from commmon attacks  e.g. sql injection

    detectBot({
      mode: "LIVE", 
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        //"CATEGORY:MONITOR", /"/ Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    slidingWindow({
      mode: "LIVE",
      max: 60,
      interval: 60, 
    }),
  ],
});


export default aj