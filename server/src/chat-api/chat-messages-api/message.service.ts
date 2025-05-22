import { ChatMessageModel } from "./message.model";

// Create a single message document
export const createMessage = async (message: any) => {
  const doc = await ChatMessageModel.create(message);
  return doc;
};

// Get all messages for a botId, sorted by creation time
export const getMessages = async (botId: string) => {
  return ChatMessageModel.find({ botId }).sort({ createdAt: 1 });
};
