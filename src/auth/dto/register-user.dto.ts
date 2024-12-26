import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterUserDto {
	@IsString()
	@IsNotEmpty()
	name: string;
	@IsString()
	@IsEmail()
	email: string;
	@IsString()
	@IsNotEmpty()
	password: string;
}
