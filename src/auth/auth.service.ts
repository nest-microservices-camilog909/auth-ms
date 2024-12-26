import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { envs } from 'src/config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
	public readonly logger = new Logger('AuthService');

	constructor(private readonly jwtService: JwtService) {
		super();
	}

	onModuleInit() {
		this.$connect();
		this.logger.log('Database is connected');
	}

	async signJWT(payload: { id: string; name: string; email: string }) {
		return this.jwtService.sign(payload);
	}

	async verify(token) {
		try {
			const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
				secret: envs.secret_jwt,
			});

			return { user, token: await this.signJWT(user) };
		} catch (e) {
			throw new RpcException({
				status: HttpStatus.UNAUTHORIZED,
				message: e.message,
			});
		}
	}

	async register(request: RegisterUserDto) {
		const userFound = await this.user.findMany({
			where: {
				email: request.email,
			},
		});

		if (userFound.length > 0) {
			throw new RpcException({
				status: HttpStatus.BAD_REQUEST,
				message: 'User already exists',
			});
		}

		try {
			const userCreated = await this.user.create({
				data: {
					email: request.email.toLowerCase(),
					name: request.name.trim().toUpperCase(),
					password: bcrypt.hashSync(request.password, 10),
				},
			});

			const { password: _, ...user } = userCreated;

			return { user, token: await this.signJWT(user) };
		} catch (e) {
			throw new RpcException({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				message: e.message,
			});
		}
	}

	async login(request: LoginUserDto) {
		const userFound = await this.user.findMany({
			where: {
				email: request.email,
			},
		});

		if (userFound.length < 1) {
			throw new RpcException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Email or password not valid',
			});
		}

		const { password, ...user } = userFound[0];

		const isPasswordValid = bcrypt.compareSync(request.password, password);

		if (!isPasswordValid) {
			throw new RpcException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Email or password not valid',
			});
		}

		return { user, token: await this.signJWT(user) };
	}
}
