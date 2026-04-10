import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDB from "./db/db.js";
import http from "http";
import { attachSocket } from "./socket.js";

const port = process.env.PORT || 8000;

connectDB()
  .then(() => {
    const server = http.createServer(app);
    attachSocket(server);

    server.listen(port, () => console.log(`server is listening`));
    app.get("/", (req, res) => {
      res.send(`
    <h2>Chat App API </h2>
  <p>Status: Running</p>
  <a href="/api-docs">Go to API Docs</a>
  `);
    });
  })
  .catch((error) => {
    console.log("MONGODB CONNECTION FAILED 2!!", error);
  });
