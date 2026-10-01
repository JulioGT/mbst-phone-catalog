import type { LogFields, Logger } from '../../src/application/ports/logger';

export interface LogEntry {
  readonly level: 'info' | 'warn' | 'error';
  readonly message: string;
  readonly fields: LogFields;
}

/** Keeps log entries in memory instead of printing them; tests read `entries`. */
export class InMemoryLogger implements Logger {
  readonly entries: LogEntry[] = [];

  info(message: string, fields: LogFields = {}): void {
    this.entries.push({ level: 'info', message, fields });
  }

  warn(message: string, fields: LogFields = {}): void {
    this.entries.push({ level: 'warn', message, fields });
  }

  error(message: string, fields: LogFields = {}): void {
    this.entries.push({ level: 'error', message, fields });
  }
}
