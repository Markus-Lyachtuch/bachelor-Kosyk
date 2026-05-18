import multer from "multer";
import { Router } from "express";
import {
  register,
  login,
  me,
  logout,
  googleAuthRedirect,
  googleAuthCallback,
  refreshToken,
  confirmEmail,
  confirmEmailByToken,
  forgetPassword,
  resetPassword,
  updateProfile,
} from "../controllers/auth.controller";
import { validate } from "../middlewares/validateRequest";
import { registerSchema, loginSchema, forgetPasswordSchema, resetPasswordSchema, updateProfileSchema } from "../dtos/auth.dto";
import { authHandler } from "../middlewares/authHandler";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/me", authHandler, me);
router.get("/refresh", refreshToken);
router.get("/logout", authHandler, logout);
router.post("/login", validate(loginSchema), login);
router.post("/register", validate(registerSchema), register);
router.post("/emailConfirmation", confirmEmail);
router.get("/emailConfirmation", confirmEmailByToken);
router.post("/forgetPassword", validate(forgetPasswordSchema), forgetPassword);
router.patch("/users/password", validate(resetPasswordSchema), resetPassword);

router.get("/google", googleAuthRedirect);
router.get("/google/callback", googleAuthCallback);

router.patch("/profile", authHandler, upload.single("avatar"), validate(updateProfileSchema), updateProfile);

export default router;
