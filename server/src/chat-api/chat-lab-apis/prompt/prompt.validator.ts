import { IsString, IsArray, ArrayMinSize, ValidateNested, IsBoolean, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Type } from 'class-transformer';
import "reflect-metadata";

// Custom validator to ensure only one isUseForChat is true
@ValidatorConstraint({ name: "OnlyOneUseForChat", async: false })
class OnlyOneUseForChat implements ValidatorConstraintInterface {
  validate(prompts: any[], args: ValidationArguments) {
    return prompts.filter(p => p.isUseForChat).length <= 1;
  }
  defaultMessage(args: ValidationArguments) {
    return "Only one prompt can have isUseForChat=true";
  }
}

class PromptItemDTO {
  @IsString() name!: string;
  @IsString() prompt!: string;
  @IsString() output!: string; // Should be JSON string, validate in controller
  @IsBoolean() isUseForChat!: boolean;
}

export class UpdatePromptDTO {
  @IsArray()
  @ArrayMinSize(1, { message: "At least one prompt is required" })
  @ValidateNested({ each: true })
  @Type(() => PromptItemDTO)
  @Validate(OnlyOneUseForChat)
  prompt!: PromptItemDTO[];
}
