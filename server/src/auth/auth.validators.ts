import { IsEmail, IsString, IsOptional, Length, Matches } from 'class-validator';

export class SignupDTO {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @IsString()
  @Length(6, 128, { message: 'Password must be at least 6 characters' })
  password!: string;

  @IsString()
  @Length(6, 128, { message: 'Confirm password must be at least 6 characters' })
  confirmPassword!: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsString()
  role?: 'general' | 'dev' | 'admin'; 
}

export class SigninDTO {
  @IsString()
  identifier!: string; // email or phone

  @IsString()
  @Length(6, 128, { message: 'Password must be at least 6 characters' })
  password!: string;
}

export class ForgotPasswordStep1DTO {
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;
}

export class ForgotPasswordStep2DTO {
  @IsString()
  @Length(6, 12, { message: 'OTP must be at least 6 characters' })
  otp!: string;

  @IsString()
  @Length(6, 128, { message: 'New password must be at least 6 characters' })
  newPassword!: string;

  @IsString()
  @Length(6, 128, { message: 'Confirm password must be at least 6 characters' })
  confirmPassword!: string;
}

export class UpdateProfileDTO {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;
}

export class UpdatePasswordDTO {
  @Length(6)
  currentPassword!: string;

  @Length(6)
  newPassword!: string;

  @Length(6)
  confirmNewPassword!: string;
}
