import { IsString, IsArray, IsOptional, IsBoolean, ArrayNotEmpty, IsIn, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

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

export class CreateChildBotDTO {
  @IsString() name!: string;
  @IsString() type!: string;
  @IsString() description!: string;
  @IsArray() tags!: string[];
  @IsString() category!: string;
}

export class UpdateChildBotDTO {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() tags?: string[];
  @IsOptional() @IsString() category?: string;
}

export class ShareChildBotDTO {
  @IsString() botId!: string;
  @IsArray() @ArrayNotEmpty() @Validate(IsEmailOrPhoneConstraint, { each: true })
  shareBotUserIdentifiers!: string[];
  @IsOptional() @IsBoolean() canEdit?: boolean;
  @IsOptional() @IsBoolean() canDelete?: boolean;
}
