import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
const router = express.Router();
import {
  getAllContacts,
  getMessagesByUserId,
  sendMessage,
  getChatPartners
} from "../controllers/message.controller.js";

//Protected routes
router.use(verifyJWT)
router.route("/contacts").get(getAllContacts); // All people except us
router.route('/chats').get(getChatPartners); //people we have chatted with (both sent or received messages)
router.route("/:id").get(getMessagesByUserId); //Messages between 2 users (logged in user and user with params:id)
router.route("/send/:id").post(sendMessage,); // to send text or image

export default router;
