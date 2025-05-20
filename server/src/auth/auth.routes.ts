import { Router } from "express";
import { signup, signin, forgotPasswordStep1, forgotPasswordStep2, getUserInfo, updateProfile, updatePassword, sendVerificationOtp, verifyUserOtp, signupWithGoogle, signinWithGoogle } from "./auth.controllers";
import { authenticateJWT } from "./auth.middleware";

const router = Router();

// Signup
router.post("/signup", signup);

// Signin
router.post("/signin", signin);

// Forgot password step 1 (send email)
router.post("/forgot-password", forgotPasswordStep1);

// Forgot password step 2 (reset password with OTP)
router.post("/reset-password", forgotPasswordStep2);

// ✅ Protected route
router.get('/user-info', authenticateJWT, getUserInfo);
router.patch('/update-profile', authenticateJWT, updateProfile);
router.patch('/update-password', authenticateJWT, updatePassword);
router.post("/send-verification-otp", authenticateJWT, sendVerificationOtp);
router.post("/verify-otp", authenticateJWT, verifyUserOtp);

// Signup and Signin with Google
router.post("/signup-google", signupWithGoogle);
router.post("/signin-google", signinWithGoogle);

export default router;
