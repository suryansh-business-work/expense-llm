import { PropertyModel } from "./property.model";

export const createProperty = (data: any) => PropertyModel.create(data);
export const getProperties = (themeId: string) =>
  PropertyModel.find({ themeId });
export const getProperty = (propertyId: string) =>
  PropertyModel.findOne({ propertyId });
export const updateProperty = (propertyId: string, update: any) =>
  PropertyModel.findOneAndUpdate({ propertyId }, { $set: update }, { new: true });
export const deleteProperty = (propertyId: string) =>
  PropertyModel.findOneAndDelete({ propertyId });

export const addPropertyValues = (propertyId: string, values: string[]) =>
  PropertyModel.findOneAndUpdate(
    { propertyId },
    { $addToSet: { propertyValues: { $each: values } } },
    { new: true }
  );

export const removePropertyValue = (propertyId: string, value: string) =>
  PropertyModel.findOneAndUpdate(
    { propertyId },
    { $pull: { propertyValues: value } },
    { new: true }
  );

