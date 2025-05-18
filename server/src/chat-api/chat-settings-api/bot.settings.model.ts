import { Schema, model } from "mongoose";

const chatSettingSchema = new Schema({
  botId: { type: String, required: true, unique: true },
  modelSetting: {
    model: { type: String, default: "gpt-3.5-turbo" },
    modelName: { type: String, default: "gpt-3.5-turbo" },
    modelType: { type: String, default: "chat" },
    modelDescription: {
      type: String,
      default:
        "GPT-3.5 Turbo is a variant of the GPT-3 model that is optimized for chat-based applications.",
    },
    modelVersion: {
      version: { type: String, default: "v1" },
      description: {
        type: String,
        default: "The latest version of the GPT-3.5 Turbo model.",
      },
      date: { type: String, default: "2023-10-01" },
      releaseNotes: {
        url: {
          type: String,
          default: "https://platform.openai.com/docs/guides/gpt/release-notes",
        },
        description: {
          type: String,
          default: "Release notes for the latest version of the GPT-3.5 Turbo model.",
        },
        label: { type: String, default: "Release Notes" },
        labelDescription: {
          type: String,
          default:
            "Label for the link to the release notes for the latest version of the GPT-3.5 Turbo model.",
        },
        labelDate: { type: String, default: "2023-10-01" },
      },
    },
    maxTokens: { type: Number, default: 1000 },
    fileUpload: {
      maxSize: { type: Number, default: 10 },
      unit: { type: String, default: "MB" },
      valueInBytes: { type: Number, default: 1024 * 1024 * 10 },
    },
  },
  appearance: {
    font: { type: String, default: "Roboto" },
    chatBackground: { type: String, default: "#f5f7fa" },
    bot: {
      bubble: {
        background: { type: String, default: "#e3f2fd" },
        textColor: { type: String, default: "#1976d2" },
        borderRadius: { type: String, default: "10px" },
        borderWidth: { type: String, default: "1px" },
        borderColor: { type: String, default: "#e0e0e0" },
      },
      avatar: {
        url: { type: String, default: "" },
        shape: { type: String, default: "circle" },
        size: { type: String, default: "50px" },
      },
    },
    user: {
      bubble: {
        background: { type: String, default: "#fff" },
        textColor: { type: String, default: "#222" },
        borderRadius: { type: String, default: "10px" },
        borderWidth: { type: String, default: "1px" },
        borderColor: { type: String, default: "#e0e0e0" },
      },
      avatar: {
        url: { type: String, default: "" },
        shape: { type: String, default: "circle" },
        size: { type: String, default: "50px" },
      },
    },
  },
  advanced: {
    autoScroll: { type: Boolean, default: true },
    showTypingIndicator: { type: Boolean, default: true },
    showTimestamps: { type: Boolean, default: true },
  },
  report: {
    format: { type: String, default: "text" },
    schedule: { type: String, default: "daily" },
    time: { type: String, default: "09:00" },
    timeZone: { type: String, default: "UTC" },
    email: { type: String, default: "" },
    emailSubject: { type: String, default: "Chatbot Report" },
  },
});

export const ChatSettingModel = model("ChatSetting", chatSettingSchema);
