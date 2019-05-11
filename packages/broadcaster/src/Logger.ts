import winston from "winston";

export const Logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.errors(),
    winston.format.json()
  ),
  level: process.env.NODE_ENV === "production" ? "notice" : "debug",
  transports: [new winston.transports.Console()]
});
