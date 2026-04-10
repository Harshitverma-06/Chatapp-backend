import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  Allcontacts,
  MessagesByUserId,
  messageSend,
  ChatPartners,
  deleteMessageById,
} from "../services/message.service.js";
import { getIO } from "../socketState.js";


const getAllContacts = asyncHandler (async (req,res) => {
    const users = await Allcontacts(req)
    res.status(200)
    .json(new ApiResponse(200,users,"Users fetched!!"))
})

const getChatPartners = asyncHandler (async (req,res) => {
    const Partners = await ChatPartners(req)
    console.log(Partners);
    
    res.status(200)
    .json(new ApiResponse(200,Partners))
})

const getMessagesByUserId = asyncHandler (async (req,res) => {
    const messages = await MessagesByUserId(req)
    res.status(200)
    .json(new ApiResponse(200,messages))
})

const sendMessage = asyncHandler (async (req,res) => {
    const message = await messageSend(req)
    res.status(200)
    .json(new ApiResponse(200,message))
})

const deleteMessage = asyncHandler(async (req, res) => {
  const info = await deleteMessageById(req);

  const io = getIO();
  if (io && info) {
    const messageId = String(info.messageId);
    io.to(String(info.senderId)).emit("message_deleted", { messageId });
    io.to(String(info.receiverId)).emit("message_deleted", { messageId });
  }
  return res.status(200).json({
    success: true,
    message: "Message deleted successfully",
  });
});



export { getAllContacts, getMessagesByUserId, sendMessage, getChatPartners, deleteMessage };