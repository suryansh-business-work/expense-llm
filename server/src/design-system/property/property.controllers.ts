import { Request, Response } from "express";
import * as service from "./property.service";
import { errorResponse, noContentResponse, successResponse } from "../../utils/response-object";

// 6. Create Property
export const createProperty = async (req: Request, res: Response) => {
  try {
    const property = await service.createProperty(req.body);
    return successResponse(res, property, "Property created");
  } catch (err) {
    return errorResponse(res, err, "Failed to create property");
  }
};

// 7. Get All Properties for a Theme
export const getProperties = async (req: Request, res: Response) => {
  try {
    const properties = await service.getProperties(req.params.themeId);
    if (!properties.length) return noContentResponse(res, [], "No properties found");
    return successResponse(res, properties, "Properties fetched");
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch properties");
  }
};

// 8. Get Property by ID
export const getProperty = async (req: Request, res: Response) => {
  try {
    const property = await service.getProperty(req.params.propertyId);
    if (!property) return noContentResponse(res, null, "Property not found");
    return successResponse(res, property, "Property fetched");
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch property");
  }
};

// 9. Update Property
export const updateProperty = async (req: Request, res: Response) => {
  try {
    const property = await service.updateProperty(req.params.propertyId, req.body);
    if (!property) return noContentResponse(res, null, "Property not found");
    return successResponse(res, property, "Property updated");
  } catch (err) {
    return errorResponse(res, err, "Failed to update property");
  }
};

// 10. Delete Property
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const deletedProperty = await service.deleteProperty(req.params.propertyId);
    if (!deletedProperty) return noContentResponse(res, null, "Property not found");
    return successResponse(res, deletedProperty, "Property deleted");
  } catch (err) {
    return errorResponse(res, err, "Failed to delete property");
  }
};

// 11. Add Property Values (array of string)
export const addPropertyValues = async (req: Request, res: Response) => {
  try {
    const property = await service.addPropertyValues(req.params.propertyId, req.body.propertyValues);
    if (property == null) {
      return noContentResponse(res, null, "Property not found");
    }
    return successResponse(res, property, "Property values added");
  } catch (err) {
    return errorResponse(res, err, "Failed to add property values");
  }
};

// 12. Remove Property Value (by value)
export const removePropertyValue = async (req: Request, res: Response) => {
  try {
    const result = await service.removePropertyValue(req.params.propertyId, req.body.value);
    if (result === undefined || result === null) return noContentResponse(res, null, "Property not found");
    return successResponse(res, result, "Property value removed");
  } catch (err) {
    return errorResponse(res, err, "Failed to remove property value");
  }
};
