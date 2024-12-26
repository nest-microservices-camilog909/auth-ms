import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
	PORT: number;
	NATS_SERVERS: string[];
	DATABASE_URL: string;
	SECRET_JWT: string;
}

const envsSchema = joi
	.object({
		PORT: joi.number().required(),
		NATS_SERVERS: joi.array().items(joi.string()).required(),
		DATABASE_URL: joi.string().required(),
		SECRET_JWT: joi.string().required(),
	})
	.unknown(true);

const { error, value } = envsSchema.validate({
	...process.env,
	NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
	throw new Error(`Config valition error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
	port: envVars.PORT,
	nats_servers: envVars.NATS_SERVERS,
	database_url: envVars.DATABASE_URL,
	secret_jwt: envVars.SECRET_JWT,
};
