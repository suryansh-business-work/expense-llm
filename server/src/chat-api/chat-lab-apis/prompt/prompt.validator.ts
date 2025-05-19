import { IsString, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import "reflect-metadata";

class PromptItemDTO {
  @IsString() name!: string;
  @IsString() prompt!: string;
}

export class UpdatePromptDTO {
  @IsArray()
  @ArrayMinSize(1, { message: "At least one prompt is required" })
  @ValidateNested({ each: true })
  @Type(() => PromptItemDTO)
  prompt!: PromptItemDTO[];
}
