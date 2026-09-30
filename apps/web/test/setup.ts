import '@testing-library/jest-dom';
import { format } from 'node:util';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

/**
 * The challenge requires a browser console free of errors and warnings, so any
 * test that makes React (or our code) call console.error or console.warn fails.
 * A test that expects such a call may replace the spy with its own.
 */
let consoleProblems: string[] = [];

beforeEach(() => {
  consoleProblems = [];
  for (const method of ['error', 'warn'] as const) {
    jest.spyOn(console, method).mockImplementation((...args: unknown[]) => {
      consoleProblems.push(`console.${method}: ${format(...args)}`);
    });
  }
});

afterEach(() => {
  jest.restoreAllMocks();
  window.localStorage.clear();
  if (consoleProblems.length > 0) {
    throw new Error(`The test logged to the console:\n${consoleProblems.join('\n')}`);
  }
});
