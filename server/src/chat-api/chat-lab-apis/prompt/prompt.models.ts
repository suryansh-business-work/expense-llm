import mongoose, { Schema, model } from "mongoose";

const PromptSchema = new Schema({
  botId: { type: String, required: true, unique: true },
  prompt: [
    {
      name: { type: String, required: true },
      prompt: { type: String, required: true }
    }
  ]
});

const PromptModel = model("Prompt", PromptSchema);

export { PromptModel };
