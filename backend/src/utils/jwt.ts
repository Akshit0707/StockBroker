import dotenv from 'dotenv';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET: Secret = process.env.JWT_SECRET ?? 'your_jwt_secret';
const JWT_EXPIRES_IN: SignOptions['expiresIn'] =
  (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) ?? '24h';

export interface JwtPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: JwtPayload): string => {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  } catch {
    throw new Error('Error generating token');
  }
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    throw new Error('Invalid token');
  }
};