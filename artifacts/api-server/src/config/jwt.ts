export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || "changeme-super-secret-jwt-key",
  expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
} as const;
