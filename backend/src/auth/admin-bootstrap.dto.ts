import { IsEmail, IsString, MinLength } from 'class-validator';

export class AdminBootstrapDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsString()
  bootstrapSecret: string;
}
