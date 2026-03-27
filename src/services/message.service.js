import { ApiError } from "../utils/ApiError.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const Allcontacts = async (req) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password -refreshToken");
    return filteredUsers;
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};

const ChatPartners = async (req) => {
  try {
    const loggedInUserId = req.user._id;
    
    //find all messages where user is sender or reciever
    const messages = await Message.find({
      $or: [
        { senderId: loggedInUserId },
        { receiverId: loggedInUserId },
      ],
    });
    // If senderID = myID (that means im the sender so we will have to fetch the other user i.e. reciever's id) return recievers id (msg.receiverId.toString())
    // else case (:) = if we Im not the sender i.e. im the reciever so we will have to fetch the sender's Id (msg.senderId.toString())
    const chatpartnerIds = [//storing all ids in array
      ...new Set( //Set returns unique values only (...will spread all ids in array)
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString(),
        ),
      ),
    ];

    const chatPartners = await User.find({_id: {$in: chatpartnerIds}}).select("-password -refreshToken")

    return chatPartners
  } catch (error) {
    console.error("Error in getChatpartners: ",error.message)
    throw new ApiError(500, error.message);
  }
};


const MessagesByUserId = async (req) => {
  try {
    const myUserId = req.user._id;
    const { id: userToChatId } = req.params;
    const message = await Message.find({
      $or: [
        { senderId: myUserId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myUserId },
      ],
    });

    return message;
  } catch (error) {
    console.log("error in retrieving messages", error);
    throw new ApiError(500, error.message);
  }
};

const messageSend = async (req) => {
  try {
    const { text, image } = req.body;
    // `image` may come either as a multer upload (`req.file`) or as a base64/data URL string.
    if (!(text || image || req.file)) {
        throw new ApiError(409,"No message to send")
    }
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    const recieverExists = await User.exists({_id:receiverId})
    if(!recieverExists) {
        throw new ApiError(409,"Cannot find user")
    }

    let imageUrl;
    if (req.file?.buffer) {
      try {
        const uploadResponse = await uploadOnCloudinary(req.file.buffer, {
          folder: "messages",
        });
        imageUrl = uploadResponse?.secure_url || uploadResponse?.url;
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        throw new ApiError(400, "Failed to upload image");
      }
    } else if (image) {
      // Backward compatibility: allow string-based uploads.
      try {
        const uploadResponse = await uploadOnCloudinary(image);
        imageUrl = uploadResponse?.secure_url || uploadResponse?.url;
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        throw new ApiError(400, "Failed to upload image");
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    await newMessage.save();
    //Send message in real time using socket.io
    return newMessage;
  } catch (error) {
    console.log("error in sending message", error);
    throw new ApiError(500, error.message);
  }
};

export { Allcontacts, MessagesByUserId, messageSend, ChatPartners };
