import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';

export interface RecordedRequest {
  readonly method: string;
  readonly url: string;
  readonly apiKey: string | undefined;
}

export type StubHandler = (request: IncomingMessage, response: ServerResponse) => void;

export interface StubServer {
  readonly baseUrl: string;
  readonly requests: RecordedRequest[];
  handle(handler: StubHandler): void;
  close(): Promise<void>;
}

/** A local stand-in for the remote catalog API, on a random free port. */
export async function startStubServer(): Promise<StubServer> {
  const requests: RecordedRequest[] = [];
  let current: StubHandler = (_request, response) => {
    response.writeHead(500).end();
  };

  const server = createServer((request, response) => {
    const apiKey = request.headers['x-api-key'];
    requests.push({
      method: request.method ?? '',
      url: request.url ?? '',
      apiKey: Array.isArray(apiKey) ? apiKey[0] : apiKey,
    });
    current(request, response);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    requests,
    handle(handler) {
      current = handler;
    },
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.closeAllConnections();
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
}

export function json(status: number, body: unknown): StubHandler {
  return (_request, response) => {
    response.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(body));
  };
}
