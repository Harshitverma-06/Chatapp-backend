import aj from "../utils/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

const arcjetProtection = async (req, res, next) => {
  try {
    const decision = await aj.protect(req);
    const isProduction = process.env.NODE_ENV === "production";

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res
          .status(429)
          .json({ message: "Rate limit reached, Please try again later" });
      } else if (decision.reason.isBot()) {
        // Bot detection can false-positive for server-to-server calls (e.g. python-requests)
        // during development. Only enforce bot blocks in production.
        if (isProduction) {
          return res.status(403).json({ message: "Bot access denied" });
        }
      } else {
        return res
          .status(403)
          .json({ message: "Access denied due to security policy" });
      }
    }

    //Check for spoofed bots
    if (isProduction && decision.results.some(isSpoofedBot)) {
        return res.status(403).json(
            {
                error:"spoofed bot detected",
                message:"Malicious bot activity detected"
            }
        )
    }

    next();
  } catch (error) {
    console.log("Arcjet protection Error:", error);
    console.error(error);
    next(error);
  }
};

export default arcjetProtection