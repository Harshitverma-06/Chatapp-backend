import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
const router = express.Router();
import { upload } from "../middlewares/multer.middleware.js";
import {
  getAllContacts,
  getMessagesByUserId,
  sendMessage,
  getChatPartners,
  deleteMessage,
} from "../controllers/message.controller.js";

//Protected routes
router.use(verifyJWT)

/**
 * @swagger
 * /api/message/contacts:
 *   get:
 *     tags:
 *       - Message
 *     summary: Get all users except current user
 *     description: Retrieve a list of all users in the database except the currently logged-in user. Useful for initiating new conversations.
 *     security:
 *       - Bearer: []
 *     responses:
 *       '200':
 *         description: List of all available contacts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           username:
 *                             type: string
 *                           email:
 *                             type: string
 *                           fullname:
 *                             type: string
 *                           avatar:
 *                             type: string
 *       '401':
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route("/contacts").get(getAllContacts);

/**
 * @swagger
 * /api/message/chats:
 *   get:
 *     tags:
 *       - Message
 *     summary: Get list of chat partners
 *     description: Retrieve a list of all users the current user has had conversations with (both sent and received messages)
 *     security:
 *       - Bearer: []
 *     responses:
 *       '200':
 *         description: List of chat partners retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route('/chats').get(getChatPartners);

/**
 * @swagger
 * /api/message/{id}:
 *   get:
 *     tags:
 *       - Message
 *     summary: Get messages between two users
 *     description: Retrieve all messages exchanged between the current logged-in user and the specified user (by their ID)
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID of the conversation partner
 *         schema:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *     responses:
 *       '200':
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *       '401':
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route("/:id").get(getMessagesByUserId);

/**
 * @swagger
 * /api/message/send/{id}:
 *   post:
 *     tags:
 *       - Message
 *     summary: Send a message or image
 *     description: Send a text message and/or image to another user. At least one of text or image must be provided.
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID of the message recipient
 *         schema:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Text content of the message (optional)
 *                 example: Hello, how are you?
 *                 maxLength: 2000
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image attachment (optional)
 *     responses:
 *       '200':
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Message'
 *       '400':
 *         description: Bad request - missing text or image, or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401':
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '404':
 *         description: Recipient user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.route("/send/:id").post(upload.single("image"), sendMessage);

/**
 * DELETE /api/message/delete/:id
 * Protected: only sender can delete (unsend) their message.
 */
router.route("/delete/:id").delete(deleteMessage);

export default router;
