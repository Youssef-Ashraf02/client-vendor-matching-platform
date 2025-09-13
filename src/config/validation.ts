import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(3000),

  MYSQL_HOST: Joi.string().required(),
  MYSQL_PORT: Joi.number().default(3306),
  MYSQL_USER: Joi.string().required(),
  MYSQL_PASSWORD: Joi.string().required(),
  MYSQL_DB: Joi.string().required(),

  MONGO_URI: Joi.string().uri().required(),

  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('3600s'),

  SMTP_HOST: Joi.string().default('localhost'),
  SMTP_PORT: Joi.number().default(2525),
  SMTP_USER: Joi.string().allow(''),
  SMTP_PASS: Joi.string().allow(''),
  SMTP_FROM: Joi.string().default('Expanders360 <no-reply@expanders360.local>'),

  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(60),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
});

