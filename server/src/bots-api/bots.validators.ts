import { IsString, IsArray, IsOptional, IsBoolean, ArrayNotEmpty, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

@ValidatorConstraint({ name: 'isEmailOrPhone', async: false })
class IsEmailOrPhoneConstraint implements ValidatorConstraintInterface {
  validate(identifier: string, args: ValidationArguments) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?\d{10,15}$/;
    return emailRegex.test(identifier) || phoneRegex.test(identifier);
  }
  defaultMessage(args: ValidationArguments) {
    return 'Each identifier must be a valid email or phone number';
  }
}

export class CreateBotDTO {
  @IsString() name!: string;
  @IsString() description!: string;
  @IsArray() tags!: string[];
}

export class UpdateBotDTO {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() tags?: string[];
}

export class ShareBotDTO {
  @IsString() botId!: string;
  @IsArray() @ArrayNotEmpty() @Validate(IsEmailOrPhoneConstraint, { each: true })
  shareBotUserIdentifiers!: string[];
  @IsOptional() @IsBoolean() canEdit?: boolean;
  @IsOptional() @IsBoolean() canDelete?: boolean;
}
