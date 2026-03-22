import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Allcontacts , MessagesByUserId , messageSend , ChatPartners} from "../services/message.service.js";


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




export {getAllContacts , getMessagesByUserId , sendMessage , getChatPartners}