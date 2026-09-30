export type LogFields = Readonly<Record<string, string | number | boolean | undefined>>;

/** Structured logging. Never pass secrets (the API key) or full upstream payloads. */
export interface Logger {
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
}
