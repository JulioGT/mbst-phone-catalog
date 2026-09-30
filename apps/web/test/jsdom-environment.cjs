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

    /**
     * `<search>` (HTML 2023) is supported by every current browser but unknown
     * to jsdom, so React would warn about it. Only that tag is taught here;
     * any other unknown tag still triggers React's warning.
     */
    // jsdom does not implement scrolling (React Router's ScrollRestoration scrolls).
    this.global.scrollTo = () => undefined;

    const { document } = this.global;
    const createElement = document.createElement.bind(document);
    document.createElement = (tagName, options) => {
      const element = createElement(tagName, options);
      if (String(tagName).toLowerCase() === 'search') {
        Object.defineProperty(element, Symbol.toStringTag, { value: 'HTMLElement' });
      }
      return element;
    };
  }
};
