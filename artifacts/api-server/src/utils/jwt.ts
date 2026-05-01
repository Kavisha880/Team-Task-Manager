import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwt";

export function signToken(payload: { id: string; role: string }): string {
  return jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expiresIn,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): { id: string; role: string } {
  return jwt.verify(token, JWT_CONFIG.secret) as { id: string; role: string };
}
