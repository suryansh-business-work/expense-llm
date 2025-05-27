import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const themeSchema = new Schema({
  themeId: { type: String, required: true, unique: true, default: uuidv4 }, // UUID auto-generated
  themeName: { type: String, required: true },
  selected: { type: Boolean, default: false }, // <-- Add this line
});

export const ThemeModel = model("Theme", themeSchema);