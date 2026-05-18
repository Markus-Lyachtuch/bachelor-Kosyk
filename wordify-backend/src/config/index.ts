import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.string().optional(),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default("1h"),
  REFRESH_SECRET: z.string().min(8),
  FRONTEND_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url(),
  REFRESH_EXPIRES_IN: z.string().default("14d"),
  DICTIONARY_API_URL: z.string(),
  DATAMUSE_API_URL: z.string(),
  ML_API_URL: z.string(),
  PEXELS_API_KEY: z.string().min(1),
  PEXELS_BASE_URL: z.string().min(1),
  AWS_REGION: z.string().min(1),
  AWS_S3_BUCKET_NAME: z.string().min(1),
  EMAIL_FOR_SENDING_NOTIFICATIONS: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

const parsed = envSchema.parse(process.env);

export default {
  databaseUrl: parsed.DATABASE_URL,
  port: Number(parsed.PORT ?? 4000),
  jwtSecret: parsed.JWT_SECRET,
  jwtExpiresIn: parsed.JWT_EXPIRES_IN,
  refreshSecret: parsed.REFRESH_SECRET,
  frontendUrl: parsed.FRONTEND_URL,
  nodeEnv: parsed.NODE_ENV,
  googleClientId: parsed.GOOGLE_CLIENT_ID,
  googleClientSecret: parsed.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: parsed.GOOGLE_REDIRECT_URI,
  refreshExpiresIn: parsed.REFRESH_EXPIRES_IN,
  dictionaryApiUrl: parsed.DICTIONARY_API_URL,
  datamuseApiUrl: parsed.DATAMUSE_API_URL,
  mlApiUrl: parsed.ML_API_URL,
  pexelsApiKey: parsed.PEXELS_API_KEY,
  pexelsBaseUrl: parsed.PEXELS_BASE_URL,
  awsRegion: parsed.AWS_REGION,
  awsS3BucketName: parsed.AWS_S3_BUCKET_NAME,
  emailForSendingNotifications: parsed.EMAIL_FOR_SENDING_NOTIFICATIONS,
  resendApiKey: parsed.RESEND_API_KEY,
  smtpHost: parsed.SMTP_HOST,
  smtpPort: parsed.SMTP_PORT,
  smtpUser: parsed.SMTP_USER,
  smtpPass: parsed.RESEND_API_KEY, // because it uses resend as smtp server
};
