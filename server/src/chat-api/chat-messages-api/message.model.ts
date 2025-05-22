import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    botId: { type: String, required: true, index: true },
    role: { type: String, enum: ["user", "bot", "system"], required: true },
    content: { type: Schema.Types.Mixed, required: true },
    userContext: { type: Object, required: true }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

export const ChatMessageModel = model("ChatMessage", messageSchema);
