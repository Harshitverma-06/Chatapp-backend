import { ApiError } from "../utils/ApiError.js";
import { sendWelcomeEmail } from "../emails/emailHandler.js";
import { User } from "../models/user.model.js";
import  { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); //while saving in mongodb , all fields are required so we will set validation as false because we are not saving all fields
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating refresh and access",
    );
  }
};

const registerUser = async (req) => {
  const { username, fullname, email, password } = req.body;

  //Any empty field
  if (!fullname || !email || !password || !username) {
    throw new ApiError(400, "All fields are required");
  }

  //Password less than 6 characters
  if (password.length < 6) {
    throw new ApiError(400, "Password must be atleast 6 characters");
  }

  //Invalid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  //User already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }], //Checking if user already exists
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path; //Saving avatars local path

  let avatar = null;
  if (avatarLocalPath) {
    try {
      avatar = await uploadOnCloudinary(avatarLocalPath);
    } catch (uploadError) {
      console.error("Avatar upload failed:", uploadError);
      throw new ApiError(400, "Failed to upload avatar");
    }
  }

  if (avatar) {
    const user = await User.create({
      fullname: fullname.trim(),
      email,
      password,
      username: username.toLowerCase(),
      avatar: avatar.url,
    });
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken", //find user by id but remove password feild and refreshtoken feild
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong!! User not created"); // if user not created/not found in database
    }

    // try {
    //   await sendWelcomeEmail(
    //     createdUser.email,
    //     createdUser.fullname,
    //     process.env.CLIENT_URL,
    //   );
    // } catch (error) {
    //   throw new ApiError(409, "failed to send welcome email");
    // }

    return createdUser;
  } else {
    const user = await User.create({
      fullname: fullname.trim(),
      email,
      password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken", //find user by id but remove password feild and refreshtoken feild
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong!! User not created"); // if user not created/not found in database
    }

    // try {
    //   await sendWelcomeEmail(
    //     createdUser.email,
    //     createdUser.fullname,
    //     process.env.CLIENT_URL,
    //   );
    // } catch (error) {
    //   throw new ApiError(409, "failed to send welcome email");
    // }

    return createdUser;
  }
};

const loginUser = async (req) => {
  const { email, username, password } = req.body; //recieving data
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }], //this or operator will find user on the basis of username or email
  });

  if (!user) {
    throw new ApiError(404, "User does not exist!!");
  }

  const isPasswordvalid = await user.isPasswordCorrect(password);
  if (!isPasswordvalid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  return { loggedInUser, accessToken, refreshToken };
};

const logOut = async (req) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      returnDocument: "after",
    },
  );

  return { message: "User logged out successfully" };
};

const updatePassword = async (req) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(400, "Invalid password");
  }
};

const updateAccountDetails = async (req) => {
  const { fullname, email, username } = req.body;

  if (!(fullname || email || username)) {
    throw new ApiError(400, "at least one field is required");
  }

  // Check if username already exists (if username is being updated)
  if (username) {
    const existingUsername = await User.findOne({
      username: username.toLowerCase(),
      _id: { $ne: req.user?._id }, // Exclude current user
    });
    if (existingUsername) {
      throw new ApiError(409, "Username already exists");
    }
  }

  const updateData = {};
  if (fullname) updateData.fullname = fullname;
  if (email) updateData.email = email;
  if (username) updateData.username = username.toLowerCase();

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: updateData,
    },
    {
      returnDocument: "after", // returns updated information
    },
  ).select("-password");

  return user;
};

const updateAvatar = async (req) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is missing");
  }

  // Get user's current avatar URL
  const user = await User.findById(req.user?._id);
  const oldAvatarUrl = user?.avatar;

  // Delete old avatar from Cloudinary if it exists
  if (oldAvatarUrl) {
    await deleteFromCloudinary(oldAvatarUrl);
  }

  // Upload new avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { returnDocument: 'after' },
  ).select("-password");

  return updatedUser;
};

export {
  registerUser,
  loginUser,
  logOut,
  updatePassword,
  updateAccountDetails,
  updateAvatar,
};
