import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller()
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@MessagePattern('auth.register')
	register(@Payload() request: RegisterUserDto) {
		return this.authService.register(request);
	}

	@MessagePattern('auth.login')
	login(@Payload() request: LoginUserDto) {
		return this.authService.login(request);
	}

	@MessagePattern('auth.verify')
	verify(@Payload() token: string) {
		return this.authService.verify(token);
	}
}
