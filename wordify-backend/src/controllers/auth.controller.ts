import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { RefreshPayload, signJwt, signRefreshToken, verifyJwt, verifyRefreshToken } from "../utils/jwt";
import { getCookiesOptions } from "../utils/cookiesOptions";
import { getGoogleAuthUrl, getGoogleTokens, decodeGoogleIdToken } from "../utils/googleOAuth";
import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";

import config from "../config/index";
import { ApiError } from "../utils/apiError";
import { prisma } from "../server";
import { validateToken } from "../utils/validateToken";
import { ALLOWED_MIME_TYPES, MAX_AVATAR_SIZE } from "../const/user";

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.registerUser({ req, res });

    const token = signJwt({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });
    const refreshToken = signRefreshToken({
      sessionId: result.refreshSession.id,
      userId: result.user.id,
    });

    res.cookie("accessToken", token, getCookiesOptions(config.jwtExpiresIn));
    res.cookie("refreshToken", refreshToken, getCookiesOptions(config.refreshExpiresIn));

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.loginUser({ req, res });
    const token = signJwt({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });
    const refreshToken = signRefreshToken({
      sessionId: result.refreshSession.id,
      userId: result.user.id,
    });

    res.cookie("accessToken", token, getCookiesOptions(config.jwtExpiresIn));
    res.cookie("refreshToken", refreshToken, getCookiesOptions(config.refreshExpiresIn));

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function forgetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.forgetPasswordService({ req });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.resetPasswordService({ req });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const refreshToken = req.cookies?.refreshToken as string | undefined;
  if (!refreshToken) {
    res.status(401).json({ message: "No refresh token provided" });
    return;
  }
  try {
    const payload = verifyRefreshToken(refreshToken) as RefreshPayload;
    const session = await authService.getSessionById(payload.sessionId);

    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({ message: "Invalid or expired refresh token" });
      return;
    }

    const user = await authService.getUserById({ id: payload.userId });
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    const newAccessToken = signJwt({
      userId: payload.userId,
      email: user.email,
      role: user.role,
    });
    res.cookie("accessToken", newAccessToken, getCookiesOptions(config.jwtExpiresIn));

    const newRefreshToken = signRefreshToken({
      sessionId: payload.sessionId,
      userId: payload.userId,
    });

    res.cookie("refreshToken", newRefreshToken, getCookiesOptions(config.refreshExpiresIn));
    res.status(200).json({ message: "Tokens refreshed" });
    return;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      const decoded = jwt.decode(refreshToken) as { sessionId: number };
      await authService.deleteSession(decoded.sessionId);
      res.status(401).json({ message: "Refresh token expired" });
      return;
    }

    res.status(401).json({ message: "Invalid refresh token" });
    next(err);
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.accessToken as string | undefined;

  const payload = verifyJwt(token!);
  const userInfo = await authService.getUserById({ id: payload.userId });

  res.status(200).json({
    user: {
      id: payload.userId,
      email: payload.email,
      name: userInfo?.name,
      provider: userInfo?.provider,
      isVerified: userInfo?.isVerified,
      picture: payload.picture ? payload.picture : userInfo?.avatarUrl,
    },
  });
}

export async function confirmEmail(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.accessToken;
  const payload = validateToken(token);
  const userInfo = await authService.getUserById({ id: payload.userId });

  if (!userInfo) {
    throw new ApiError(404, "User not found");
  }

  if (userInfo.isVerified) {
    res.status(400).json({ message: "Email already verified" });
    return;
  }

  if (userInfo.email) {
    const verificationEmailToken = signJwt({
      userId: payload.userId,
      isVerified: true,
    });
    await authService.sendConfirmationEmailService(userInfo.email, userInfo.name, verificationEmailToken);
  }

  res.status(200).json({ message: "Email confirmation sent" });
}

export async function confirmEmailByToken(req: Request, res: Response): Promise<void> {
  const token = req.query.token as string;
  const payload = validateToken(token);
  const userInfo = await authService.getUserById({ id: payload.userId });

  if (!userInfo) {
    throw new ApiError(404, "User not found");
  }

  if (userInfo.isVerified) {
    res.status(400).json({ message: "Email already verified" });
    return;
  }

  await authService.updateEmailVerification({ id: payload.userId, isVerified: true });
  res.status(200).json({ message: "Email confirmed successfully" });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
  res.status(200).json({ message: "Logged out" });
}

export const googleAuthRedirect = (_: Request, res: Response) => {
  const state = randomUUID();
  const url = getGoogleAuthUrl(state);
  res.redirect(url);
};

export const googleAuthCallback = async (req: Request, res: Response) => {
  const { code } = req.query as { code?: string; state?: string };

  if (!code) {
    return res.redirect(`${config.frontendUrl}/auth/login?error=google`);
  }

  const { id_token } = await getGoogleTokens(code);
  const payload = await decodeGoogleIdToken(id_token);

  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser && existingUser.provider !== "google") {
    return res.redirect(`${config.frontendUrl}/auth/login?error=google_user_already_exists`);
  }

  let user;
  if (existingUser && existingUser.provider === "google") {
    user = await authService.updateUser({
      name: payload.name ?? existingUser.name,
      googleId: payload.sub,
      id: existingUser.id,
      avatarUrl: payload.picture,
    });
  } else {
    user = await authService.createUser({
      name: payload.name ?? "",
      email: payload.email,
      provider: "google",
      googleId: payload.sub,
      avatarUrl: payload.picture,
    });
  }

  if (!user) {
    throw new ApiError(500, "Failed to create or update user");
  }

  const session = await authService.createRefreshSession(user.id, req.ip ?? "", req.get("user-agent") ?? "");
  const token = signJwt({
    userId: user.id,
    email: user.email,
    role: user.role,
    picture: payload.picture,
  });
  const refreshToken = signRefreshToken({
    sessionId: session.id,
    userId: user.id,
  });
  res.cookie("accessToken", token, getCookiesOptions(config.jwtExpiresIn));
  res.cookie("refreshToken", refreshToken, getCookiesOptions(config.refreshExpiresIn));
  return res.redirect(`${config.frontendUrl}/home`);
};

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = res.locals.payload;
    const file = (req as any).file as import("multer").File | undefined;

    if (file) {
      if (file.size > MAX_AVATAR_SIZE) {
        throw new ApiError(400, "Avatar image must be less than 2 MB");
      }
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new ApiError(400, "Avatar must be an image (JPEG, PNG, WebP)");
      }
    }

    const { name, email, password, currentPassword } = req.body;

    const result = await authService.updateProfileService({
      userId,
      name,
      email,
      password,
      currentPassword,
      avatarFile: file,
    });

    const newToken = signJwt({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    res.cookie("accessToken", newToken, getCookiesOptions(config.jwtExpiresIn));
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
