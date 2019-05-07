import winston from "winston";

const enumerateErrorFormat = winston.format((info: any) => {
  if (info.error && info.error instanceof Error) {
    info.error = {
      message: info.error.message,
      name: info.error.name,
      stack: info.error.stack
    };
  }

  return info;
});

export const Logger = winston.createLogger({
  format: winston.format.combine(enumerateErrorFormat(), winston.format.json()),
  level: "debug",
  transports: [new winston.transports.Console()]
});
