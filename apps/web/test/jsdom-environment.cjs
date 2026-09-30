const { TestEnvironment } = require('jest-environment-jsdom');

/**
 * jsdom, the simulated browser, lacks APIs that every real browser has and
 * React Router uses: the Fetch classes and TextEncoder/TextDecoder. Node has
 * standard implementations, so we lend them. AbortController and AbortSignal
 * come along because Node's Request only accepts Node's own AbortSignal.
 */
module.exports = class BrowserLikeEnvironment extends TestEnvironment {
  constructor(...args) {
    super(...args);
    Object.assign(this.global, {
      AbortController,
      AbortSignal,
      Headers,
      Request,
      Response,
      TextDecoder,
      TextEncoder,
      fetch,
    });
  }
};
