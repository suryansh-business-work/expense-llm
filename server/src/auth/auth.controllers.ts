import { Request, Response } from 'express';
import { validate } from 'class-validator';
import {
  SignupDTO,
  SigninDTO,
  ForgotPasswordStep1DTO,
  ForgotPasswordStep2DTO,
  UpdateProfileDTO,
  UpdatePasswordDTO,
} from './auth.validators';
import { OtpVerificationModel, UserModel } from './auth.models';
import {
  hashPassword,
  comparePasswords,
  generateToken,
  generateOTP,
  verifyGoogleToken,
} from './auth.services';
import {
  successResponse,
  errorResponse,
  noContentResponse,
} from '../utils/response-object'; // adjust path as needed
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { SubcriptionModel } from '../chat-api/subscription-api/subscription-usage.model';
dayjs.extend(utc);
dayjs.extend(timezone);

// Utility to sanitize user object (removes sensitive fields)
const sanitizeUser = (user: any) => {
  if (!user) return null;
  const { password, __v, _id, ...rest } = user.toObject ? user.toObject() : user;
  return rest; 
};

// --- Auth Controllers ---

export const signup = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new SignupDTO(), req.body);
    const errors = await validate(dto);
    if (errors.length) return errorResponse(res, errors, 'Validation failed');

    const { firstName, lastName, email, password, confirmPassword, profileImage, role } = dto;
    if (password !== confirmPassword)
      return errorResponse(res, null, 'Passwords do not match');

    const existing = await UserModel.findOne({ email });
    if (existing)
      return errorResponse(res, null, 'User already exists');

    const user = new UserModel({
      firstName,
      lastName,
      email,
      password: await hashPassword(password),
      isUserVerified: false,
      profileImage: profileImage || 'https://ik.imagekit.io/esdata1/botify/botify-logo-1_j7vjRlSiwH.png',
      role: role || "general", // <-- set role, default to general
    });
    await user.save();
    const subcriptionModel = new SubcriptionModel({
      userId: user?.userId,
      tokenCount: 1000000, // Default token count
    })
    await subcriptionModel.save();
    return successResponse(res, { user: sanitizeUser(user) }, 'User registered successfully');
  } catch (err) {
    return errorResponse(res, err, 'Signup failed');
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new SigninDTO(), req.body);
    const errors = await validate(dto);
    if (errors.length) return errorResponse(res, errors, 'Validation failed');

    const { identifier, password } = dto;
    const user = await UserModel.findOne({ email: identifier });
    if (!user) return errorResponse(res, null, 'Invalid credentials');

    // If user has no password, warn to login with Google
    if (!user.password) {
      return errorResponse(res, null, "Kindly login with Google. You do not have any password with your account.");
    }

    if (!(await comparePasswords(password, user.password)))
      return errorResponse(res, null, 'Invalid credentials');

    const token = generateToken(user.userId);
    return successResponse(res, {
      token,
      user: sanitizeUser(user),
    }, 'Login successful');
  } catch (err) {
    return errorResponse(res, err, 'Signin failed');
  }
};

// In-memory OTP store (should use a persistent store in production)
let otpStore: { [email: string]: string } = {};

export const forgotPasswordStep1 = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new ForgotPasswordStep1DTO(), req.body);
    const errors = await validate(dto);
    if (errors.length) return errorResponse(res, errors, 'Validation failed');

    const user = await UserModel.findOne({ email: dto.email });
    if (!user) return noContentResponse(res, null, 'User not found');

    const otp = generateOTP();
    console.log(user.email, "Your OTP", `Your OTP is ${otp}`);
    otpStore[user.email] = otp;

    return successResponse(res, { user: sanitizeUser(user) }, 'OTP sent');
  } catch (err) {
    return errorResponse(res, err, 'Failed to send OTP');
  }
};

export const forgotPasswordStep2 = async (req: Request, res: Response) => {
  try {
    const dto = Object.assign(new ForgotPasswordStep2DTO(), req.body);
    const errors = await validate(dto);
    if (errors.length) return errorResponse(res, errors, 'Validation failed');

    const { otp, newPassword, confirmPassword } = dto;
    const email = req.body.email;
    if (newPassword !== confirmPassword)
      return errorResponse(res, null, 'Passwords do not match');
    if (otp !== otpStore[email])
      return errorResponse(res, null, 'Invalid OTP');

    const user = await UserModel.findOne({ email });
    if (!user) return noContentResponse(res, null, 'User not found');

    user.password = await hashPassword(newPassword);
    await user.save();
    delete otpStore[email];

    return successResponse(res, { user: sanitizeUser(user) }, 'Password reset successfully');
  } catch (err) {
    return errorResponse(res, err, 'Failed to reset password');
  }
};

export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await UserModel.findOne({ userId });
    if (!user) return errorResponse(res, null, 'User not found');

    return successResponse(res, { user: sanitizeUser(user) }, 'User info fetched successfully');
  } catch (err) {
    return errorResponse(res, err, 'Failed to fetch user info');
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const dto = Object.assign(new UpdateProfileDTO(), req.body);
    const errors = await validate(dto, { skipMissingProperties: true });
    if (errors.length) return errorResponse(res, errors, 'Validation failed');
    const allowedUpdates = ['firstName', 'lastName', 'email', 'profileImage'];
    const updateData: any = {};
    for (const key of allowedUpdates) {
      if (req.body[key]) {
        updateData[key] = req.body[key];
      }
    }

    const user = await UserModel.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true }
    );

    if (!user) return errorResponse(res, null, 'User not found');

    return successResponse(res, { user: sanitizeUser(user) }, 'Profile updated successfully');
  } catch (err) {
    return errorResponse(res, err, 'Failed to update profile');
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const dto = Object.assign(new UpdatePasswordDTO(), req.body);
    const errors = await validate(dto);
    if (errors.length) return errorResponse(res, errors, 'Validation failed');

    const { currentPassword, newPassword, confirmNewPassword } = dto;
    if (newPassword !== confirmNewPassword)
      return errorResponse(res, null, 'New passwords do not match');

    const user = await UserModel.findOne({ userId });
    if (!user) return errorResponse(res, null, 'User not found');

    const valid = await comparePasswords(currentPassword, user.password ?? "");
    if (!valid) return errorResponse(res, null, 'Current password is incorrect');

    user.password = await hashPassword(newPassword);
    await user.save();

    return successResponse(res, { user: sanitizeUser(user) }, 'Password updated successfully');
  } catch (err) {
    return errorResponse(res, err, 'Failed to update password');
  }
};

export const sendVerificationOtp = async (req: { userId: any; }, res: any) => {
  try {
    const userId = req.userId;
    const user = await UserModel.findOne({ userId });
    if (!user) return errorResponse(res, null, "User not found");
    if (user.isUserVerified) return errorResponse(res, null, "User already verified");

    // Remove any existing OTPs for this user
    await OtpVerificationModel.deleteMany({ userId });

    const otp = generateOTP();
    await OtpVerificationModel.create({
      userId,
      email: user.email,
      otp,
      createdAt: dayjs().tz("Asia/Kolkata").toDate(),
    });

    // TODO: Send OTP via email (implement your email logic here)
    // await sendOTP(user.email);
    console.log(user.email, "Your OTP", `Your OTP is ${otp}`);

    return successResponse(res, null, "OTP sent to your email");
  } catch (err) {
    return errorResponse(res, err, "Failed to send OTP");
  }
};

export const verifyUserOtp = async (req: { userId: any; body: { otp: any; }; }, res: any) => {
  try {
    const userId = req.userId;
    const { otp } = req.body;
    const otpEntry = await OtpVerificationModel.findOne({ userId });

    if (!otpEntry) return errorResponse(res, null, "OTP expired or not found");

    // Check expiry (10 min)
    const now = dayjs().tz("Asia/Kolkata");
    const created = dayjs(otpEntry.createdAt).tz("Asia/Kolkata");
    if (now.diff(created, "minute") > 10) {
      await OtpVerificationModel.deleteOne({ userId });
      return errorResponse(res, null, "OTP expired");
    }

    if (otpEntry.otp !== otp) return errorResponse(res, null, "Invalid OTP");

    // Mark user as verified
    await UserModel.updateOne({ userId }, { isUserVerified: true });
    await OtpVerificationModel.deleteOne({ userId });

    return successResponse(res, null, "User verified successfully");
  } catch (err) {
    return errorResponse(res, err, "Failed to verify OTP");
  }
};

// For Google signup
export const signupWithGoogle = async (req: Request, res: Response) => {
  try {
    const { credential, role } = req.body; // <-- accept role from body
    if (!credential) return errorResponse(res, null, "Missing Google credential");

    const payload = await verifyGoogleToken(credential);
    if (!payload?.email) return errorResponse(res, null, "Google account has no email");

    // Check if user already exists
    let user = await UserModel.findOne({ email: payload.email });

    if (user) {
      // User already exists, show message to sign in
      return errorResponse(res, null, "User already exists. You can sign in.");
    }

    // Create new user
    user = new UserModel({
      firstName: payload.given_name || "",
      lastName: payload.family_name || "",
      email: payload.email,
      isUserVerified: true,
      profileImage: payload.picture,
      password: undefined, // No password for Google users
      role: role || "general", // <-- set role, default to general
    });
    await user.save();
    const subcriptionModel = new SubcriptionModel({
      userId: user?.userId,
      tokenCount: 1000000, // Default token count
    })
    await subcriptionModel.save();

    const token = generateToken(user.userId);
    return successResponse(res, { token, user: sanitizeUser(user) }, "Signup successful with Google");
  } catch (err) {
    return errorResponse(res, err, "Google signup failed");
  }
};

export const signinWithGoogle = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    if (!credential) return errorResponse(res, null, "Missing Google credential");

    const payload = await verifyGoogleToken(credential);
    if (!payload?.email) return errorResponse(res, null, "Google account has no email");

    const user = await UserModel.findOne({ email: payload.email });

    if (!user) {
      return errorResponse(res, null, "No account found. Please sign up with Google first.");
    }

    // If user has password, warn to login with password
    if (user.password) {
      return errorResponse(res, null, "Kindly login with email and password. You do not have a Google account linked.");
    }

    const token = generateToken(user.userId);
    return successResponse(res, { token, user: sanitizeUser(user) }, "Login successful with Google");
  } catch (err) {
    return errorResponse(res, err, "Google signin failed");
  }
};
