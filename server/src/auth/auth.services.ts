import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const hashPassword = async (password: string) => await bcrypt.hash(password, 10);

export const comparePasswords = async (password: string, hash: string) => await bcrypt.compare(password, hash);

export const generateToken = (userId: string) => jwt.sign({ userId }, 'SECRET_KEY'); // Replace with env var

export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const verifyGoogleToken = async (token: string) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
};
