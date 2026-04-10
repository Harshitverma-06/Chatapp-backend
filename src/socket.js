import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { User } from "./models/user.model.js";
import { messageSend } from "./services/message.service.js";
import { setIO } from "./socketState.js";

function parseCookies(cookieHeader = "") {
  const out = {};
  if (!cookieHeader) return out;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(val);
  }
  return out;
}

async function getUserFromHandshake(socket) {
  const authToken = socket.handshake?.auth?.token;
  const cookieHeader = socket.handshake?.headers?.cookie || "";
  const cookies = parseCookies(cookieHeader);
  const headerAuth = socket.handshake?.headers?.authorization || socket.handshake?.headers?.Authorization;

  const token =
    authToken ||
    cookies?.accessToken ||
    (typeof headerAuth === "string" ? headerAuth.replace(/^Bearer\s+/i, "") : null);

  if (!token) return null;

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const user = await User.findById(decoded?._id).select("-password -refreshToken");
  return user || null;
}

export function attachSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
    // Allow base64 image payloads (still enforce our own limits below)
    maxHttpBufferSize: 10 * 1024 * 1024, // 10MB
  });
  setIO(io);

  io.use(async (socket, next) => {
    try {
      const user = await getUserFromHandshake(socket);
      if (!user) return next(new Error("Unauthorized"));
      socket.user = user;
      socket.join(String(user._id)); // room per userId
      next();
    } catch (e) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.emit("connected", { userId: String(socket.user?._id) });

    socket.on("send_message", async (payload = {}, ack) => {
      try {
        const receiverId = String(payload.receiverId || "").trim();
        const text = (payload.text || "").toString();
        const image = payload.image;

        if (!receiverId) throw new Error("receiverId is required");
        const hasText = Boolean(text && text.trim());
        const hasImage = typeof image === "string" && image.length > 0;
        if (!hasText && !hasImage) throw new Error("text or image is required");

        // Safety: reject very large string payloads (base64/data URLs)
        if (hasImage && typeof image === "string" && image.length > 7 * 1024 * 1024) {
          throw new Error("Image is too large for realtime. Please try again.");
        }

        // Reuse existing service logic (expects Express-like req shape)
        const fakeReq = {
          user: socket.user,
          params: { id: receiverId },
          body: { text, image },
          file: undefined,
        };

        const msg = await messageSend(fakeReq);

        const data = {
          _id: msg?._id,
          senderId: msg?.senderId,
          receiverId: msg?.receiverId,
          text: msg?.text,
          image: msg?.image,
          createdAt: msg?.createdAt,
        };

        // emit to receiver room + also to sender room (for multi-tab sync)
        io.to(String(receiverId)).emit("receive_message", data);
        io.to(String(socket.user?._id)).emit("receive_message", data);

        if (typeof ack === "function") ack({ success: true, data });
      } catch (e) {
        if (typeof ack === "function") ack({ success: false, message: e?.message || "Failed to send message" });
      }
    });
  });

  return io;
}

