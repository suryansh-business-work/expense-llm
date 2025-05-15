import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from './auth.models';
import { v4 as uuidv4 } from 'uuid';

export const hashPassword = async (password: string) => await bcrypt.hash(password, 10);

export const comparePasswords = async (password: string, hash: string) => await bcrypt.compare(password, hash);

export const generateToken = (userId: string) => jwt.sign({ userId }, 'SECRET_KEY'); // Replace with env var

export const sendOTP = async (email: string, phone: string) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // Simulate email and SMS sending here
  (`Send OTP ${otp} to email ${email} and phone ${phone}`);
  return otp;
};
