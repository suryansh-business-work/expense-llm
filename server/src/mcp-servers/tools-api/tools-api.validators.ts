import { IsString, IsArray, IsOptional, IsBoolean, ValidateNested, ArrayMinSize } from "class-validator";
import { Type } from "class-transformer";

export class ToolParamDTO {
  @IsString() paramName!: string;
  @IsString() paramType!: string;
}

export class CreateToolDTO {
  @IsString() mcpServerId!: string;
  @IsString() toolName!: string;
  @IsOptional() @IsString() toolDescription?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true })
  @Type(() => ToolParamDTO)
  toolParams?: ToolParamDTO[];
  @IsString() createdBy!: string;
}

export class UpdateToolDTO {
  @IsOptional() @IsString() toolName?: string;
  @IsOptional() @IsString() toolDescription?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true })
  @Type(() => ToolParamDTO)
  toolParams?: ToolParamDTO[];
  @IsOptional() @IsBoolean() active?: boolean;
}