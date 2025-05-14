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
import { UserModel } from './auth.models';
import {
  hashPassword,
  comparePasswords,
  generateToken,
  sendOTP,
} from './auth.services';
import {
  successResponse,
  errorResponse,
  noContentResponse,
} from '../utils/response-object'; // adjust path as needed

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

    const { firstName, lastName, email, phone, password, confirmPassword } = dto;
    if (password !== confirmPassword)
      return errorResponse(res, null, 'Passwords do not match');

    const existing = await UserModel.findOne({ $or: [{ email }, { phone }] });
    if (existing)
      return errorResponse(res, null, 'User already exists');

    const user = new UserModel({
      firstName,
      lastName,
      email,
      phone,
      password: await hashPassword(password),
    });
    await user.save();

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
    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });
    if (!user || !(await comparePasswords(password, user.password)))
      return errorResponse(res, null, 'Invalid credentials');

    const token = generateToken(user.userId);
    return successResponse(res, { token, user: sanitizeUser(user) }, 'Signin successful');
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

    const otp = await sendOTP(user.email, user.phone);
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

    const allowedUpdates = ['firstName', 'lastName', 'email', 'phone'];
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

    const valid = await comparePasswords(currentPassword, user.password);
    if (!valid) return errorResponse(res, null, 'Current password is incorrect');

    user.password = await hashPassword(newPassword);
    await user.save();

    return successResponse(res, { user: sanitizeUser(user) }, 'Password updated successfully');
  } catch (err) {
    return errorResponse(res, err, 'Failed to update password');
  }
};
