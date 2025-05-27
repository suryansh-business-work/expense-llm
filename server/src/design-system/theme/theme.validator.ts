import { IsString, IsOptional, IsBoolean } from "class-validator";

export class CreateThemeDTO {
  @IsString() themeId!: string;
  @IsString() themeName!: string;
  @IsOptional() @IsBoolean() selected?: boolean;
}

export class UpdateThemeDTO {
  @IsOptional() @IsString() themeName?: string;
  @IsOptional() @IsBoolean() selected?: boolean;
}
