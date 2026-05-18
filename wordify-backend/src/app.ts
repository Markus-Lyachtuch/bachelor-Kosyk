import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { apiRoutes, defaultRoutes } from "./routes";

import { errorHandler } from "./middlewares/errorHandler";
import { prisma, server } from "./server";

const app = express();
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://wordify.pp.ua"],
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", apiRoutes);
app.use("/", defaultRoutes);
app.set("trust proxy", 1); 

app.use(errorHandler);

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await prisma.$disconnect();
    console.log('Prisma disconnected');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
