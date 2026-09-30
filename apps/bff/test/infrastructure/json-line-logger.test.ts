import { expect } from 'chai';
import { JsonLineLogger } from '../../src/infrastructure/logging/json-line-logger';

describe('JsonLineLogger', () => {
  it('writes one JSON object per line with time, level, message and fields', () => {
    const lines: string[] = [];
    const logger = new JsonLineLogger(
      { write: (line: string) => lines.push(line) },
      () => new Date('2026-09-30T12:00:00.000Z'),
    );

    logger.warn('Upstream returned duplicate products', { duplicates: 1 });

    expect(lines).to.have.length(1);
    expect(lines[0]?.endsWith('\n')).to.equal(true);
    expect(JSON.parse(lines[0] ?? '')).to.deep.equal({
      duplicates: 1,
      time: '2026-09-30T12:00:00.000Z',
      level: 'warn',
      message: 'Upstream returned duplicate products',
    });
  });

  it('does not let fields overwrite level, time or message', () => {
    const lines: string[] = [];
    const logger = new JsonLineLogger({ write: (line: string) => lines.push(line) });

    logger.info('real message', { level: 'error', message: 'fake' });

    expect(JSON.parse(lines[0] ?? '')).to.include({ level: 'info', message: 'real message' });
  });
});
