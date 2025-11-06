const ms = require('ms');

const config = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 4000
  },
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rbac_capstone',
    options: {
      autoIndex: true,
      maxPoolSize: 10
    }
  },
  auth: {
    accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
    refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || '7d',
    jwtSecret: process.env.JWT_SECRET || 'rbac-capstone-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'rbac-capstone-refresh-secret',
    cookieName: process.env.REFRESH_COOKIE_NAME || 'rbac_refresh',
    cookieOptions: {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: ms(process.env.REFRESH_TOKEN_TTL || '7d')
    }
  },
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(function (v) { return v.trim(); }),
    credentials: true
  },
  rateLimit: {
    windowMs: 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX || 120)
  }
};

module.exports = config;
