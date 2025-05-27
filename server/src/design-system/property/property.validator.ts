import { IsString, IsArray, IsOptional, IsUUID } from "class-validator";

export class CreatePropertyDTO {
  @IsString() propertyId!: string;
  @IsString() themeId!: string;
  @IsString() name!: string;
  @IsString() propertyType!: string;
  @IsOptional() @IsArray() propertyValues?: string[];
}

export class UpdatePropertyDTO {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() propertyType?: string;
  @IsOptional() @IsArray() propertyValues?: string[];
}
