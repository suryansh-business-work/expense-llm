import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateChatSettingDTO {
  @IsString() botId!: string;
  @IsOptional() modelSetting?: any;
  @IsOptional() appearance?: any;
  @IsOptional() advanced?: any;
  @IsOptional() report?: any;
}

export class UpdateChatSettingDTO {
  @IsOptional() modelSetting?: any;
  @IsOptional() appearance?: any;
  @IsOptional() advanced?: any;
  @IsOptional() report?: any;
}