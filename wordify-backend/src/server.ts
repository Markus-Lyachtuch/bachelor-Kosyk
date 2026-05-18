import "module-alias/register";
import app from "./app";
import config from "./config/index";
import { PrismaClient } from "@prisma/client";
import { seedOxfordDataset } from "./scripts/seedOxfordDataset";


export const prisma = new PrismaClient();

export const server = app.listen(config.port, async () => {
  await prisma.$connect();
  console.log(`Server listening on port ${config.port}`);
  console.log(`Database is connected`);
  if (config.nodeEnv === "development") {
    await seedOxfordDataset();
  }
});

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
