import winston from "winston";

export const Logger = winston.createLogger({
  format:
    process.env.NODE_ENV === "production"
      ? winston.format.combine(winston.format.errors(), winston.format.json())
      : winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          winston.format.simple()
        ),
  level: process.env.NODE_ENV === "production" ? "notice" : "debug",
  transports: [new winston.transports.Console()]
});
