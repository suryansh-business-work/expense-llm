import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new Schema({
  userId: { type: String, default: uuidv4 },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  isUserVerified: { type: Boolean, default: false },
  profileImage: { type: String, default: "https://ik.imagekit.io/esdata1/botify/botify-logo-1_j7vjRlSiwH.png" },
  role: { type: String, enum: ["general", "dev", "admin"], default: "general" },
}, { timestamps: true });

const otpVerificationSchema = new Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // 10 min expiry
});

export const UserModel = model('User', userSchema);
export const OtpVerificationModel = model('OtpVerification', otpVerificationSchema);
