import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDB from "./db/db.js";

const port = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(port, (req, res) =>
      console.log(`server is listening`),
    );
    app.get("/", (req, res) => {
      res.send(`
    Chat App API is running 

    Docs: https://chatapp-backend-vofr.onrender.com/api/docs
  `);
    });
  })
  .catch((error) => {
    console.log("MONGODB CONNECTION FAILED 2!!", error);
  });
