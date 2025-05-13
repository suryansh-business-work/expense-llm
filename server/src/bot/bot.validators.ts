import {
  validate,
  validateOrReject,
  Contains,
  IsInt,
  Length,
  IsEmail,
  IsFQDN,
  IsDate,
  Min,
  Max,
  IsNotEmpty,
  IsDefined,
  IsPhoneNumber,
  IsOptional,
  IsMongoId,
  IsAlpha,
  IsString,
  IsBoolean,
  IsUrl,
  IsIP,
  IsDateString,
  IsArray,
  isPhoneNumber,
  IS_PHONE_NUMBER,
  IsNumber,
  isArray,
  ArrayMinSize,
  ArrayNotEmpty,
  IsObject
} from 'class-validator'

export class botListValidator {
  @IsNumber()
  @IsNotEmpty()
  @IsDefined()
  page!: string

  @IsNumber()
  @IsNotEmpty()
  @IsDefined()
  limit!: string

  @IsOptional()
  @IsObject()
  sortBy!: string

  @IsOptional()
  @IsObject()
  search!: string
}

export class createBotValidator {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  botId!: string

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  userId!: string

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  botName!: string

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  botDescription!: string

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  dataAvatar!: string

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  isBotArchive!: string
}

export class deleteBotValidator {
  @IsNotEmpty()
  @IsDefined()
  botId!: Object
}

export class updateBotValidator {
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  botId!: string
  
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  botName!: string

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  botDescription!: string

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  dataAvatar!: string

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  isBotArchive!: string
}
