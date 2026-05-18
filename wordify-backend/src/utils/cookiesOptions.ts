import { CookieOptions } from "express";
import config from "../config/index";

export function getCookiesOptions(jwtExpiresIn: string): CookieOptions {
  const { nodeEnv } = config
  const isProduction = nodeEnv === "production";
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: Number(`${jwtExpiresIn}`.slice(0, -1)) * 3600 * 1000,
  };
}
