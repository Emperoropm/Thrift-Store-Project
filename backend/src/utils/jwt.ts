import jwt, { SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.JWT_SECRET_KEY as string;

// 👇 Updated interface to use 'id' instead of 'sellerId'
export interface JwtPayload {
  id: number;           // Changed from sellerId to id
  email?: string;
  role?: string;
  name?: string;        // Added optional name field
}

export const generateToken = (payload: JwtPayload) => {
  const options: SignOptions = {
    expiresIn: "3d",
  };

  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};