import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password: string) => await bcrypt.hash(password, 10);

export const comparePasswords = async (password: string, hash: string) => await bcrypt.compare(password, hash);

export const generateToken = (userId: string) => jwt.sign({ userId }, 'SECRET_KEY'); // Replace with env var

export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendOTP = async (email: string) => {
  const otp = generateOTP();
  console.log(`Send OTP ${otp} to email ${email}`);
  return otp;
};
