import ms, { StringValue } from "ms";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { ApiError } from "../utils/apiError";
import { Request, Response } from "express";
import config from "../config/index";
import { prisma } from "../server";
import { Prisma } from "@prisma/client";
import { signJwt } from "../utils/jwt";
import { validateToken } from "../utils/validateToken";

const { refreshExpiresIn } = config;

interface IRegisterUserParams {
  req: Request;
  res: Response;
}

interface ILoginUserParams {
  req: Request;
  res: Response;
}

interface IUserInfo {
  email?: string;
  id?: number;
}

interface IUpdateUserInfo extends IUserInfo {
  name: string | null;
  googleId: string;
  avatarUrl?: string;
}

interface ICreateUserInfo extends Omit<IUpdateUserInfo, "id"> {
  provider: string;
}

export async function registerUser({ req }: IRegisterUserParams) {
  const { body, ip } = req;
  const { email, password, name } = body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, "User already exists");

  const hashed = await bcrypt.hash(password, 10);
  const {
    id,
    email: userEmail,
    name: userName,
    createdAt,
    role,
    isVerified,
  } = await prisma.user.create({
    data: { email, password: hashed, name, usage: { create: {} } },
  });

  const refreshSession = await createRefreshSession(id, ip ?? "", req.get("user-agent") ?? "");

  return {
    user: { id, email: userEmail, name: userName, createdAt, role, isVerified },
    refreshSession,
  };
}

export async function loginUser({ req }: ILoginUserParams) {
  const { body, ip } = req;
  const { email, password } = body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(401, "Invalid credentials");
  const { id, email: userEmail, name, role, isVerified } = user;

  const valid = await bcrypt.compare(password, user.password ?? "");

  if (!valid) throw new ApiError(401, "Invalid credentials");

  const refreshSession = await createRefreshSession(id, ip ?? "", req.get("user-agent") ?? "");

  return { user: { id, email: userEmail, name, role, isVerified }, refreshSession };
}

export async function createRefreshSession(userId: number, ip: string, userAgent: string) {
  const ttlMs = ms(refreshExpiresIn as StringValue);
  const expiresAt = new Date(Date.now() + ttlMs);

  const session = await prisma.refreshToken.upsert({
    where: {
      userId_ip_userAgent: {
        userId,
        ip,
        userAgent,
      },
    },
    update: {
      expiresAt,
    },
    create: {
      userId,
      ip,
      userAgent,
      expiresAt,
    },
  });

  return session;
}

export async function deleteSession(sessionId: number) {
  await prisma.refreshToken.deleteMany({ where: { id: sessionId } });
}

export async function getSessionById(sessionId: number) {
  return prisma.refreshToken.findUnique({ where: { id: sessionId } });
}

export async function getUserById(userInfo: IUserInfo) {
  if (userInfo.id) {
    return await prisma.user.findUnique({ where: { id: userInfo.id } });
  } else {
    return await prisma.user.findUnique({ where: { email: userInfo.email } });
  }
}

export async function updateUser(userInfo: IUpdateUserInfo) {
  if (userInfo.id && userInfo.googleId && userInfo.name && userInfo.avatarUrl) {
    const { id, googleId, name, avatarUrl } = userInfo;
    return await prisma.user.update({ where: { id }, data: { googleId, name, avatarUrl } });
  }
}

export async function updateEmailVerification(userInfo: Prisma.UserUpdateInput & { id: number }) {
  if (userInfo.id && userInfo.isVerified !== undefined) {
    const { id, isVerified } = userInfo;
    return await prisma.user.update({ where: { id }, data: { isVerified } });
  }
}

export async function createUser(userInfo: ICreateUserInfo) {
  if (userInfo.googleId && userInfo.email) {
    const { email, name, provider, googleId, avatarUrl } = userInfo;
    return await prisma.user.create({
      data: {
        email,
        name,
        provider,
        googleId,
        avatarUrl,
        isVerified: true,
        usage: { create: {} },
      },
    });
  }
}

export async function sendConfirmationEmailService(
  email: string,
  name: string | null,
  confirmationToken: string,
  html?: string,
) {
  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: parseInt(config.smtpPort as string),
    secure: true,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });

  const htmlContent = html
    ? html
    : `Yoyy, ${name ?? "friend"}, please confirm your email by clicking on the link below: <a href="${config.frontendUrl}/auth/confirm-email?token=${confirmationToken}">Confirm email</a>`;

  const info = await transporter.sendMail({
    from: config.emailForSendingNotifications,
    to: email,
    subject: "Confirm your email",
    html: htmlContent,
  });

  return info;
}

export async function forgetPasswordService({ req }: { req: Request }) {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(404, "User not found");
  const { id, email: userEmail, name, isVerified, provider } = user;
  if (!isVerified) throw new ApiError(400, "Email not verifiedfied");
  if (provider !== "local")
    throw new ApiError(400, "This account is related with google. Use google button to log in.");

  const confirmationToken = signJwt({ userId: id, isForgetPassword: true });
  await sendConfirmationEmailService(
    userEmail,
    name,
    confirmationToken,
    `Yoyy, ${name ?? "friend"}, please confirm your email if you forgot your password by clicking on the link below: <a href="${config.frontendUrl}/auth/forget-password?token=${confirmationToken}">Reset password</a>`,
  );

  return { message: "Email confirmation sent" };
}

export async function resetPasswordService({ req }: { req: Request }) {
  const { password } = req.body;
  const token = req.query?.token as string;

  if (!token) throw new ApiError(400, "Token is required");
  const decoded = validateToken(token);
  const { userId, isForgetPassword } = decoded as { userId: number; isForgetPassword: boolean };
  if (!isForgetPassword) throw new ApiError(400, "Invalid token");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found");

  const { id: userIdToUpdate } = user;

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: userIdToUpdate }, data: { password: hashed } });
  await prisma.refreshToken.deleteMany({ where: { userId: userIdToUpdate } });

  return { message: "Password reset successfully" };
}

interface IUpdateProfileParams {
  userId: number;
  name?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
  avatarFile?: import("multer").File;
}

export async function updateProfileService({
  userId,
  name,
  email,
  password,
  currentPassword,
  avatarFile,
}: IUpdateProfileParams) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found");

  const updateData: Record<string, unknown> = {};

  if (email && email !== user.email) {
    if (user.provider === "google") {
      throw new ApiError(400, "Cannot change email for Google-authenticated accounts");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new ApiError(409, "This email is already taken");

    updateData.email = email;
    updateData.isVerified = false;
  }

  if (password) {
    if (user.provider === "google") {
      throw new ApiError(400, "Cannot change password for Google-authenticated accounts");
    }

    if (!currentPassword) {
      throw new ApiError(400, "Current password is required to set a new password");
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password ?? "");
    if (!isValidPassword) throw new ApiError(401, "Current password is incorrect");

    updateData.password = await bcrypt.hash(password, 10);
  }

  if (name !== undefined) {
    updateData.name = name;
  }

  if (avatarFile) {
    const { uploadToStorageAndGetUrl, deleteFromStorageByUrl } = await import("../utils/s3");

    if (user.avatarUrl && user.avatarUrl.includes("s3.")) {
      try {
        await deleteFromStorageByUrl(user.avatarUrl);
      } catch {}
    }

    const avatarUrl = await uploadToStorageAndGetUrl(avatarFile, "avatars");
    updateData.avatarUrl = avatarUrl;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No fields to update");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      isVerified: true,
      provider: true,
      role: true,
    },
  });

  return { user: updatedUser };
}
