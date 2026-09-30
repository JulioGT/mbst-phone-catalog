import type { LogFields, Logger } from '../../application/ports/logger';

export interface LineWriter {
  write(line: string): unknown;
}

type Level = 'info' | 'warn' | 'error';

/** Writes one JSON object per line, the format log collectors (Render included) parse. */
export class JsonLineLogger implements Logger {
  readonly #out: LineWriter;
  readonly #now: () => Date;

  constructor(out: LineWriter, now: () => Date = () => new Date()) {
    this.#out = out;
    this.#now = now;
  }

  info(message: string, fields?: LogFields): void {
    this.#write('info', message, fields);
  }

  warn(message: string, fields?: LogFields): void {
    this.#write('warn', message, fields);
  }

  error(message: string, fields?: LogFields): void {
    this.#write('error', message, fields);
  }

  #write(level: Level, message: string, fields: LogFields = {}): void {
    const entry = { ...fields, time: this.#now().toISOString(), level, message };
    this.#out.write(`${JSON.stringify(entry)}\n`);
  }
}
