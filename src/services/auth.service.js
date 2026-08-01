// The service contains the business logic.
//Controllers delegate here; they never touch the DB directly.

import bcrypt from "bcrypt";
import prisma from "../config/database.js";
import ApiError from "../utils/ApiError.js";
import {generateAccessToken,generateRefreshToken,} from "../utils/jwt.js";
import { verifyRefreshToken } from "../utils/jwt.js";

                                        //1. Register 
// a. check if user already exist
// b. hash the password
// c. create the user
// d. return user and export file

const registerUser  = async({name,email,password}) => {
    //check user already exist
    const existingUser  = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if(existingUser) throw new ApiError(409, "User Already Exist");

    //Hash password
    const hashedPassword = await bcrypt.hash(password,10);

    //create user 

    const user = await prisma.user.create({
        data:{
            name,
            email,
            password: hashedPassword,
        },
         select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });

    return user;
};





                                        //2.login
//1. find user
//2. compare password (validation)
//3. generate tokens
//4.update refresh token
//5. return token

const loginUser = async ({ email, password }) => {
    //1.find user 
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }
    //2. compare password
  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }
    
  //3.generate tokens
  const accessToken = generateAccessToken(user);

  const refreshToken = generateRefreshToken(user);

  //4. updatedb
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken,
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};

                                    //3.logout
const logoutUser = async (userId) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      refreshToken: null,
    },
  });
};                                    

                            //4. Refresh token
//here auth is based on refresh token as the access token is expired 
//so it will compare refresh token and generate the new access token and return it                            
const refreshUserToken = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
  });

  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken: newRefreshToken,
    },
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};                            

export { registerUser , loginUser ,logoutUser, refreshUserToken};