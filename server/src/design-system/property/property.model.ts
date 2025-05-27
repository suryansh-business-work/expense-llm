import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const propertySchema = new Schema({
  propertyId: { type: String, required: true, unique: true, default: uuidv4 }, 
  themeId: { type: String, required: true },
  name: { type: String, required: true },
  propertyType: { type: String, required: true },
  propertyValues: { type: [String], default: [] },
});

export const PropertyModel = model("Property", propertySchema);
