 //  Auth Controller 
 //  does not contain any contain any business login
  
//  1. Receives the HTTP request
//  2. Extracts audit context 
//  3. Delegates to the auth service
//  4. Returns the HTTP response

import { registerSchema } from "../validators/auth.schema.js";
import { registerUser } from "../services/auth.service.js";
import { loginSchema } from "../validators/auth.schema.js";
import { loginUser } from "../services/auth.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


//cookie option
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};


//register user 
const register = asyncHandler(async (req, res) => {
  const validatedData = registerSchema.parse(req.body);

  const user = await registerUser(validatedData);

  return res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", user));
});


//login user
const login = asyncHandler(async (req, res) => {
  const validatedData = loginSchema.parse(req.body);

  const { user, accessToken, refreshToken } =
    await loginUser(validatedData);

  res.cookie("accessToken", accessToken, cookieOptions);

  res.cookie("refreshToken", refreshToken, cookieOptions);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Login successful",
        user
      )
    );
});

//logout user
const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.user.id);

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, "Logout successful"));
});

//resfresh tokes
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new ApiError(401, "Refresh token missing");
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await refreshUserToken(token);

  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", newRefreshToken, cookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, "Token refreshed"));
});

//me or get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Current user fetched successfully",
        req.user
      )
    );
});


export { register,login ,logout,refreshToken,  getCurrentUser, };