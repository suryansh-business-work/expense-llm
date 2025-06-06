import { IsString, IsArray, IsOptional, IsNumber } from "class-validator";

export class CreateMcpServerDTO {
  @IsString() mcpServerCreatorId!: string;
  @IsString() userId!: string;
  @IsString() mcpServerName!: string;
}

export class UpdateMcpServerDTO {
  @IsOptional() @IsString() mcpServerName?: string;
}

export class CreateMcpServerDetailsDTO {
  @IsString() mcpServerId!: string;
  @IsString() mcpServerOverview!: string;
  @IsArray() mcpServerTags!: any[];
  @IsString() mcpServerCategory!: string;
  @IsString() mcpServerPrivacy!: string;
  @IsString() mcpServerPricingId!: string;
  @IsString() mcpServerIcon!: string;
  @IsArray() mcpServerImages!: any[];
  @IsString() mcpServerSupport!: string;
}

export class UpdateMcpServerDetailsDTO {
  @IsOptional() @IsString() mcpServerOverview?: string;
  @IsOptional() @IsArray() mcpServerTags?: any[];
  @IsOptional() @IsString() mcpServerCategory?: string;
  @IsOptional() @IsString() mcpServerPrivacy?: string;
  @IsOptional() @IsString() mcpServerPricingId?: string;
  @IsOptional() @IsString() mcpServerIcon?: string;
  @IsOptional() @IsArray() mcpServerImages?: any[];
  @IsOptional() @IsString() mcpServerSupport?: string;
}

export class CreateMcpServerPricingDTO {
  @IsString() mcpServerId!: string;
  @IsNumber() mcpServerPrice!: number;
  @IsNumber() mcpServerPerRequest!: number;
  @IsOptional() @IsString() currency?: string;
}

export class UpdateMcpServerPricingDTO {
  @IsOptional() @IsNumber() mcpServerPrice?: number;
  @IsOptional() @IsNumber() mcpServerPerRequest?: number;
  @IsOptional() @IsString() currency?: string;
}