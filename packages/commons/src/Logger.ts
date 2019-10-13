import winston from "winston";

export const Logger = winston.createLogger({
  format:
    process.env.NODE_ENV === "production"
      ? winston.format.json()
      : winston.format.combine(
          winston.format.timestamp(),
          winston.format.colorize(),
          // winston.format.errors({ stack: true }),
          winston.format.printf(
            ({ timestamp, level, message, stack, ...meta }) =>
              `${timestamp} ${level} ${message} ${
                Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta)}` : ""
              } ${stack ? `\n${stack}` : ""}`
          )
        ),
  level: process.env.NODE_ENV === "production" ? "notice" : "debug",
  transports: [new winston.transports.Console()]
});
