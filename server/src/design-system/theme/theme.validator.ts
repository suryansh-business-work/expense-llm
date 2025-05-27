import { IsString, IsArray, IsOptional, IsUUID } from "class-validator";

export class CreateThemeDTO {
  @IsString() themeId!: string;
  @IsString() themeName!: string;
}

export class UpdateThemeDTO {
  @IsOptional() @IsString() themeName?: string;
}
