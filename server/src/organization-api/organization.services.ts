import { OrganizationModel } from './organization.models';
import { CreateOrganizationDTO, UpdateOrganizationDTO } from './organization.validators';

// Create a new organization
export const createOrganization = async (userId: string, dto: CreateOrganizationDTO) => {
  const data = {
    userId,
    ...dto
  };
  return OrganizationModel.create(data);
};

// Get organization by ID
export const getOrganizationById = async (organizationId: string) => {
  return OrganizationModel.findOne({ organizationId });
};

// Get organizations by userId
export const getOrganizationsByUserId = async (userId: string) => {
  return OrganizationModel.find({ userId });
};

// Update organization
export const updateOrganization = async (organizationId: string, dto: UpdateOrganizationDTO) => {
  return OrganizationModel.findOneAndUpdate(
    { organizationId },
    { $set: dto },
    { new: true }
  );
};

// Delete organization
export const deleteOrganization = async (organizationId: string, userId: string) => {
  return OrganizationModel.findOneAndDelete({ organizationId, userId });
};

// Regenerate API key
export const regenerateApiKey = async (organizationId: string, userId: string) => {
  const { v4: uuidv4 } = require('uuid');
  return OrganizationModel.findOneAndUpdate(
    { organizationId, userId },
    { $set: { organizationApiKey: uuidv4() } },
    { new: true }
  );
};

// Get all public organizations
export const getPublicOrganizations = async () => {
  return OrganizationModel.find({ isOrganizationPublic: true, isOrganizationDisabled: false });
};