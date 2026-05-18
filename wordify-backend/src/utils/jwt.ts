import jwt, { SignOptions } from "jsonwebtoken";
import config from "../config/index";

const { refreshSecret, refreshExpiresIn, jwtExpiresIn } = config;

export type RefreshPayload = {
  sessionId: number;
  userId: number;
};

export function decodeJwt<T = any>(token: string): T {
  return jwt.decode(token) as T;
}

export function signJwt(payload: object) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: jwtExpiresIn as SignOptions["expiresIn"],
  });
}

export function verifyJwt<T = any>(token: string): T {
  return jwt.verify(token, config.jwtSecret) as T;
}

export function signRefreshToken(payload: RefreshPayload) {
  return jwt.sign(payload, refreshSecret as string, { expiresIn: refreshExpiresIn as SignOptions["expiresIn"] });
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, refreshSecret as string);
}
