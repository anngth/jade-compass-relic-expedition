/**
 * Production-safe logger utility
 * Automatically strips all logging in production builds
 */

type LogArgs = unknown[];

interface Logger {
  debug: (...args: LogArgs) => void;
  log: (...args: LogArgs) => void;
  warn: (...args: LogArgs) => void;
  error: (...args: LogArgs) => void;
  group: (label: string) => void;
  groupEnd: () => void;
}

const isDevelopment = process.env.NODE_ENV === "development";

// Allow enabling logs in browser even in production via runtime toggles
const isBrowser = typeof window !== "undefined";
const browserDebugEnabled = (() => {
  if (!isBrowser) return false;
  try {
    const qsFlag = /(?:^|[?&])debug_logs=1(?:&|$)/.test(window.location.search);
    const lsFlag = window.localStorage.getItem("DEBUG_LOGS") === "1";
    const globalFlag =
      (window as Window & { __DEBUG_LOGS__?: boolean }).__DEBUG_LOGS__ === true;
    return qsFlag || lsFlag || globalFlag;
  } catch {
    return false;
  }
})();

const createLogger = (): Logger => {
  if (isDevelopment || browserDebugEnabled) {
    const bindConsole =
      (method: keyof Console, fallback: keyof Console = "log") =>
      (...args: LogArgs) => {
        const fn = console[method] || console[fallback];
        if (typeof fn === "function") {
          (fn as (...args: LogArgs) => void).apply(console, args);
        }
      };

    return {
      debug: bindConsole("debug"),
      log: bindConsole("log"),
      warn: bindConsole("warn"),
      error: bindConsole("error"),
      group: bindConsole("group"),
      groupEnd: bindConsole("groupEnd"),
    };
  }

  // Return no-op functions for production
  const noop = () => {};
  return {
    debug: noop,
    log: noop,
    warn: noop,
    error: noop,
    group: noop,
    groupEnd: noop,
  };
};

export const logger = createLogger();

// For backwards compatibility, also export individual functions
export const { debug, log, warn, error } = logger;
