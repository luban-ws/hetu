import log4js from "log4js";
import type { Logger } from "log4js";

const DEV_MODE = process.env.NODE_ENV === "development";
const isNode =
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

// Simple browser logger
export class BrowserLogger {
  private category: string;
  private level: string;

  constructor(category: string) {
    this.category = category;
    this.level = DEV_MODE ? "debug" : "info";
  }

  private formatMessage(level: string, ...args: unknown[]): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level.toUpperCase()} ${
      this.category
    } - ${args.join(" ")}`;
  }

  debug(...args: unknown[]): void {
    if (this.level === "debug") {
      console.debug(this.formatMessage("debug", ...args));
    }
  }

  info(...args: unknown[]): void {
    console.info(this.formatMessage("info", ...args));
  }

  warn(...args: unknown[]): void {
    console.warn(this.formatMessage("warn", ...args));
  }

  error(...args: unknown[]): void {
    console.error(this.formatMessage("error", ...args));
  }
}

// Node.js logger using log4js
if (isNode) {
  log4js.configure({
    appenders: {
      console: {
        type: "console",
        layout: {
          type: "pattern",
          pattern: "%[%d{yyyy-MM-dd hh:mm:ss.SSS} %-5p %c -%] %m",
        },
      },
    },
    categories: {
      default: {
        appenders: ["console"],
        level: DEV_MODE ? "debug" : "info",
      },
    },
  });
}

export type PhotasaLogger = Logger | BrowserLogger;

// Create a logger factory
export function getLogger(category: string): PhotasaLogger {
  return isNode ? log4js.getLogger(category) : new BrowserLogger(category);
}

// Export commonly used loggers
export const loggers: Record<string, PhotasaLogger> = {
  app: getLogger("app"),
  main: getLogger("main"),
  preload: getLogger("preload"),
  renderer: getLogger("renderer"),
};
