import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { registerUser, loginUser , logOut , updatePassword, updateAccountDetails , updateAvatar} from "../services/auth.service.js";

const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
};

const signup = asyncHandler(async (req, res) => {
  const newUser = await registerUser(req);

  return res
    .status(200)
    .json(new ApiResponse(200, newUser , "User created succesfully"));
});

const login = asyncHandler(async (req, res) => { 
  const { loggedInUser, accessToken, refreshToken } = await loginUser(req);

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in succesfully",
      ),
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await logOut(req);

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  await updatePassword(req);

  return res.status(200).json(new ApiResponse(200, {}, "password changed succesfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateAccountDetails(req);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated succesfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const user = await updateAvatar(req);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "user avatar updated succesfully"));
});

export { signup , login , logOutUser , updateProfile , changeCurrentPassword , updateUserAvatar};
