const API_LIST = {
  // Auth APIs
  LOGIN: "http://localhost:3000/auth/signin",
  SIGNUP: "http://localhost:3000/auth/signup",
  FORGOT_PASSWORD: "http://localhost:3000/auth/forgot-password",
  RESET_PASSWORD: "http://localhost:3000/auth/reset-password",
  UPDATE_PROFILE: "http://localhost:3000/auth/update-profile",
  UPDATE_PASSWORD: "http://localhost:3000/auth/update-password",
  SEND_VERIFICATION_OTP: "http://localhost:3000/auth/send-verification-otp",
  VERIFY_USER_OTP: "http://localhost:3000/auth/verify-otp",
  GOOGLE_SIGNIN: "http://localhost:3000/auth/signin-google",
  GOOGLE_SIGNUP: "http://localhost:3000/auth/signup-google",

  // Bot APIs
  GET_BOTS: "http://localhost:3000/bot/bots",
  GET_CHILD_BOTS: "http://localhost:3000/bot/child-bots",
  CREATE_CHILD_BOT: "http://localhost:3000/bot/child-bots",
  UPDATE_CHILD_BOT: (botId: string) => `http://localhost:3000/bot/child-bots/${botId}`,
  DELETE_CHILD_BOT: (botId: string) => `http://localhost:3000/bot/child-bots/${botId}`,

  // Chat Settings APIs
  GET_CHAT_SETTING: (chatBotId: string) => `http://localhost:3000/bot/chat-setting/${chatBotId}`,
  UPDATE_CHAT_SETTING: (chatBotId: string) => `http://localhost:3000/bot/chat-setting/${chatBotId}`,

  // Prompt APIs
  GET_PROMPT: (chatBotId: string) => `http://localhost:3000/bot/prompt/${chatBotId}`,
  UPDATE_PROMPT: (chatBotId: string) => `http://localhost:3000/bot/prompt/${chatBotId}`,

  // Integrations (example, add more as needed)
  GET_INTEGRATIONS: "http://localhost:3000/integrations",

  // Add more APIs as you add features...
};

export default API_LIST;
