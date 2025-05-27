import { Request, Response } from "express";
import * as service from "./theme.service";
import { errorResponse, noContentResponse, successResponse } from "../../utils/response-object";

// 1. Create Theme
export const createTheme = async (req: Request, res: Response) => {
  try {
    const theme = await service.createTheme(req.body);
    return successResponse(res, theme, "Theme created");
  } catch (err) {
    return errorResponse(res, err, "Failed to create theme");
  }
};

// 2. Get All Themes
export const getThemes = async (_: Request, res: Response) => {
  try {
    const themes = await service.getThemes();
    if (!themes.length) return noContentResponse(res, [], "No themes found");
    return successResponse(res, themes, "Themes fetched");
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch themes");
  }
};

// 3. Get Theme by ID
export const getTheme = async (req: Request, res: Response) => {
  try {
    const theme = await service.getTheme(req.params.themeId);
    if (!theme) return noContentResponse(res, null, "Theme not found");
    return successResponse(res, theme, "Theme fetched");
  } catch (err) {
    return errorResponse(res, err, "Failed to fetch theme");
  }
};

// 4. Update Theme
export const updateTheme = async (req: Request, res: Response) => {
  try {
    // If selected is being set to true, set all others to false first
    if (req.body.selected === true) {
      await service.updateTheme(null, { selected: false }); // Set all to false
    }
    const theme = await service.updateTheme(req.params.themeId, req.body);
    if (!theme) return noContentResponse(res, null, "Theme not found");
    return successResponse(res, theme, "Theme updated");
  } catch (err) {
    return errorResponse(res, err, "Failed to update theme");
  }
};

// 5. Delete Theme
export const deleteTheme = async (req: Request, res: Response) => {
  try {
    const theme = await service.deleteTheme(req.params.themeId);
    if (!theme) return noContentResponse(res, null, "Theme not found");
    return successResponse(res, theme, "Theme deleted");
  } catch (err) {
    return errorResponse(res, err, "Failed to delete theme");
  }
};
