export default () => ({
  nodeEnv: process.env.NODE_ENV,
  app: {
    port: Number(process.env.PORT),
  },
  mysql: {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    db: process.env.MYSQL_DB,
  },
  mongo: {
    uri: process.env.MONGO_URI,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  },
  email: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  },
  security: {
    throttleTtl: Number(process.env.THROTTLE_TTL),
    throttleLimit: Number(process.env.THROTTLE_LIMIT),
    corsOrigin: process.env.CORS_ORIGIN,
  },
});
