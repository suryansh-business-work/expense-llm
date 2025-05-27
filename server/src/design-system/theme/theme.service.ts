import { ThemeModel } from "./theme.model";

export const createTheme = (data: any) => ThemeModel.create(data);
export const getThemes = () => ThemeModel.find();
export const getTheme = (themeId: string) => ThemeModel.findOne({ themeId });
export const updateTheme = (themeId: string, update: any) =>
  ThemeModel.findOneAndUpdate({ themeId }, { $set: update }, { new: true });
export const deleteTheme = (themeId: string) =>
  ThemeModel.findOneAndDelete({ themeId });
