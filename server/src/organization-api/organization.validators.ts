import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested, IsObject, IsEmail, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrganizationDTO {
  @IsString()
  organizationName!: string;

  @IsOptional()
  @IsString()
  organizationLogo?: string;

  @IsOptional()
  @IsObject()
  organizationCategory?: object;

  @IsOptional()
  @IsObject()
  organizationInformation?: object;

  @IsOptional()
  @IsString()
  organizationEmployeeCount?: string;

  @IsString()
  @IsEmail()
  organizationEmail!: string;

  @IsOptional()
  @IsString()
  organizationPhone?: string;

  @IsOptional()
  @IsObject()
  organizationAddress?: object;

  @IsOptional()
  @IsBoolean()
  isOrganizationPublic?: boolean;

  @IsOptional()
  @IsString()
  organizationWebsite?: string;

  @IsOptional()
  @IsObject()
  organizationRegistrationDetails?: object;

  @IsOptional()
  @IsBoolean()
  isOrganizationVerified?: boolean;
}

export class UpdateOrganizationDTO {
  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @IsString()
  organizationLogo?: string;

  @IsOptional()
  @IsObject()
  organizationCategory?: object;

  @IsOptional()
  @IsObject()
  organizationInformation?: object;

  @IsOptional()
  @IsString()
  organizationEmployeeCount?: string;

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  organizationEmails?: string[];

  @IsOptional()
  @IsString()
  organizationPhone?: string;

  @IsOptional()
  @IsObject()
  organizationAddress?: object;

  @IsOptional()
  @IsBoolean()
  isOrganizationPublic?: boolean;

  @IsOptional()
  @IsString()
  organizationWebsite?: string;

  @IsOptional()
  @IsBoolean()
  isOrganizationDisabled?: boolean;

  @IsOptional()
  @IsObject()
  organizationRegistrationDetails?: object;

  @IsOptional()
  @IsBoolean()
  isOrganizationVerified?: boolean;
}