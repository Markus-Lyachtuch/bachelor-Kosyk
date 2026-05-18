FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY .env ./
COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/data ./data
RUN npm install --omit=prod

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./

COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.7.1 /lambda-adapter /opt/extensions/lambda-adapter

ENV PORT=8080

CMD ["npm", "run", "start:prod"]
