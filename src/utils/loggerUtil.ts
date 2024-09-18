import { createLogger, format, transports } from "winston";
import path from "path";
import { rootDir } from "./commonUtil.js";

const logDir = path.join(rootDir, "logs");

const loggerUtil = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    new transports.File({ filename: path.join(logDir, "combined.log") }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  loggerUtil.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

export default loggerUtil;
