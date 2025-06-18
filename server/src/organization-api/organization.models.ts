import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const organizationSchema = new Schema({
  userId: { type: String, required: true },
  organizationId: { type: String, default: uuidv4, unique: true },
  organizationName: { type: String, required: true },
  organizationLogo: { type: String, default: '' },
  organizationCategory: { type: Schema.Types.Mixed },
  organizationInformation: { type: Schema.Types.Mixed },
  organizationEmployeeCount: { type: String },
  organizationEmail: { type: String, required: true },
  organizationPhone: { type: String, default: '' },
  organizationAddress: { type: Schema.Types.Mixed },
  organizationApiKey: { type: String, default: uuidv4, unique: true },
  isOrganizationPublic: { type: Boolean, default: false },
  organizationWebsite: { type: String },
  isOrganizationDisabled: { type: Boolean, default: false },
  organizationRegistrationDetails: { type: Schema.Types.Mixed },
  isOrganizationVerified: { type: Boolean, default: false },
}, { timestamps: true });

// Index for faster lookups by userId
organizationSchema.index({ userId: 1 });

export const OrganizationModel = model('Organization', organizationSchema);
