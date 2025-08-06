/**
 * ai-text-summariser
 * Simple JS wrapper around the browser Summarizer API.
 *
 * Exports: Summariser class
 *
 * Assumptions:
 * - Browser provides global `Summarizer` with .create(), .availability(), .summarize(), .summarizeStreaming()
 * - If running in Node for testing, availability checks that expect navigator will be bypassed.
 */

/* eslint-disable no-console */

const DEFAULTS = {
  type: "headline",
  format: "plain-text",
  length: "medium",
  expectedInputLanguages: ["en"],
  expectedContextLanguages: ["en"],
  outputLanguage: "en",
  streaming: false,
  sharedContext: null,
  // optional monitor callback: (monitor) => void
  monitor: null,
  signal: null
};

const VALID = {
  types: ["headline", "key-points", "teaser", "tldr"],
  formats: ["plain-text", "markdown"],
  lengths: ["short", "medium", "long"]
};

function isBrowser() {
  return typeof window !== "undefined" && typeof navigator !== "undefined";
}

function chromeVersionFromUA(ua) {
  // Example UA: "Mozilla/5.0 (...) Chrome/138.0.0.0 Safari/..."
  const m = ua.match(/Chrom(?:e|ium)\/(\d+)\./i);
  if (!m) return null;
  return parseInt(m[1], 10);
}

function ensureChrome138OrHigher() {
  if (!isBrowser()) return; // allow Node usage for tests — skip strict check
  const ua = navigator.userAgent || "";
  const v = chromeVersionFromUA(ua);
  if (v === null) return; // unknown UA -> allow but warn
  if (v < 138) {
    throw new Error(
      `ai-text-summariser requires Chrome >= 138. Detected Chrome ${v}.`
    );
  }
}

function validateConfig(cfg) {
  if (!VALID.types.includes(cfg.type)) {
    throw new Error(
      `Invalid type "${cfg.type}". Supported: ${VALID.types.join(", ")}.`
    );
  }
  if (!VALID.formats.includes(cfg.format)) {
    throw new Error(
      `Invalid format "${cfg.format}". Supported: ${VALID.formats.join(", ")}.`
    );
  }
  if (!VALID.lengths.includes(cfg.length)) {
    throw new Error(
      `Invalid length "${cfg.length}". Supported: ${VALID.lengths.join(", ")}.`
    );
  }
}

function mergeConfig(userCfg = {}) {
  return Object.assign({}, DEFAULTS, userCfg);
}

/**
 * Convert a ReadableStream (browser) to an async iterator yielding strings.
 * If the Summarizer already returns an async iterable, we pass it through.
 */
async function *streamToAsyncIterator(maybeStream) {
  // if it's already async iterable
  if (maybeStream && typeof maybeStream[Symbol.asyncIterator] === "function") {
    for await (const chunk of maybeStream) {
      yield chunk;
    }
    return;
  }

  // If it's a ReadableStream (web streams), convert
  if (maybeStream && typeof maybeStream.getReader === "function") {
    const reader = maybeStream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // value may be Uint8Array or string; coerce to string
        if (value instanceof Uint8Array) {
          yield new TextDecoder().decode(value);
        } else {
          yield String(value);
        }
      }
    } finally {
      try { reader.releaseLock(); } catch (_) {}
    }
    return;
  }

  throw new Error("Unsupported stream type returned by Summarizer.");
}

export class Summariser {
  /**
   * Create a new Summariser wrapper.
   * @param {Object} config - config props (see README/USAGE)
   */
  constructor(config = {}) {
    this.config = mergeConfig(config);
    validateConfig(this.config);
    this._summarizerInstance = null;
    // abort controller may be provided by user; we'll create one if not present
    this._userSignal = this.config.signal || null;
  }

  /**
   * Do a lightweight compatibility check and probe Summarizer availability.
   * Returns true if available; throws descriptive Error if Summarizer API is missing.
   */
  async checkAvailability() {
    // browser requirement
    try {
      ensureChrome138OrHigher();
    } catch (err) {
      // rethrow as descriptive error
      throw new Error(
        "Browser compatibility error: " + err.message
      );
    }

    if (typeof globalThis.Summarizer === "undefined") {
      // The environment doesn't have Summarizer API (not a supported browser).
      // We'll call Summarizer.availability if present — but if entirely missing, return false.
      return false;
    }

    // Compose availability payload
    const payload = {
      type: this.config.type,
      format: this.config.format,
      length: this.config.length,
      expectedInputLanguages: this.config.expectedInputLanguages,
      expectedContextLanguages: this.config.expectedContextLanguages,
      outputLanguage: this.config.outputLanguage
    };

    try {
      const res = await globalThis.Summarizer.availability(payload);
      // Some implementations may return {available: true} or boolean
      if (typeof res === "boolean") return res;
      if (res && typeof res.available === "boolean") return res.available;
      // fallback: truthy check
      return !!res;
    } catch (err) {
      throw new Error(
        `Summarizer availability check failed: ${err.message || err}`
      );
    }
  }

  /**
   * Create internal Summarizer instance if needed.
   * This uses Summarizer.create which supports monitor & signal.
   */
  async _createInstanceIfNeeded() {
    if (this._summarizerInstance) return this._summarizerInstance;
    if (typeof globalThis.Summarizer === "undefined") {
      throw new Error("Summarizer API not available in this environment.");
    }

    const createConfig = {
      type: this.config.type,
      format: this.config.format,
      length: this.config.length,
      sharedContext: this.config.sharedContext,
      expectedInputLanguages: this.config.expectedInputLanguages,
      expectedContextLanguages: this.config.expectedContextLanguages,
      outputLanguage: this.config.outputLanguage
    };

    // attach monitor if provided
    if (typeof this.config.monitor === "function") {
      createConfig.monitor = this.config.monitor;
    }

    if (this._userSignal) {
      createConfig.signal = this._userSignal;
    }

    try {
      this._summarizerInstance = await globalThis.Summarizer.create(createConfig);
      return this._summarizerInstance;
    } catch (err) {
      throw new Error(`Failed to create Summarizer instance: ${err.message || err}`);
    }
  }

  /**
   * Non-streaming summarise. Returns full string result.
   * @param {string} text
   * @param {string} [context]
   */
  async summarise(text, context = "") {
    if (typeof text !== "string" || text.trim() === "") {
      throw new Error("`text` must be a non-empty string.");
    }

    // Validate config again (in case user mutated)
    validateConfig(this.config);

    const available = await this.checkAvailability();
    if (!available) {
      throw new Error("Summarizer is not available for the requested configuration.");
    }

    const inst = await this._createInstanceIfNeeded();

    try {
      // Some Summarizer implementations have summarize(), others use instance.summarize()
      // We'll try instance.summarize if available, else global.
      if (inst && typeof inst.summarize === "function") {
        const res = await inst.summarize(text, { context, signal: this._userSignal });
        // If the API returns a stream-like or object, try to normalize to string.
        if (typeof res === "string") return res;
        if (res && res.text) return res.text;
        return String(res);
      } else if (typeof globalThis.Summarizer.summarize === "function") {
        const res = await globalThis.Summarizer.summarize(text, {
          type: this.config.type,
          format: this.config.format,
          length: this.config.length,
          context,
          signal: this._userSignal
        });
        return typeof res === "string" ? res : (res && res.text) ? res.text : String(res);
      } else {
        throw new Error("No compatible summarize() function found on Summarizer instance.");
      }
    } catch (err) {
      throw new Error("Summarizer failed: " + (err.message || err));
    }
  }

  /**
   * Streaming summarise. Returns an async-iterable that yields string chunks.
   * Example usage:
   *   const iter = summariser.summariseStream(text, context);
   *   for await (const chunk of iter) { ... }
   *
   * @param {string} text
   * @param {string} [context]
   */
  async *summariseStream(text, context = "") {
    if (typeof text !== "string" || text.trim() === "") {
      throw new Error("`text` must be a non-empty string.");
    }

    validateConfig(this.config);

    const available = await this.checkAvailability();
    if (!available) {
      throw new Error("Summarizer is not available for the requested configuration.");
    }

    const inst = await this._createInstanceIfNeeded();

    try {
      // Using instance.summarizeStreaming if available
      let maybeStream;
      if (inst && typeof inst.summarizeStreaming === "function") {
        maybeStream = await inst.summarizeStreaming(text, { context, signal: this._userSignal });
      } else if (typeof globalThis.Summarizer.summarizeStreaming === "function") {
        maybeStream = await globalThis.Summarizer.summarizeStreaming(text, {
          type: this.config.type,
          format: this.config.format,
          length: this.config.length,
          context,
          signal: this._userSignal
        });
      } else {
        throw new Error("No compatible summarizeStreaming() function found on Summarizer.");
      }

      // Convert to async iterator
      for await (const chunk of streamToAsyncIterator(maybeStream)) {
        yield chunk;
      }
    } catch (err) {
      throw new Error("Summarizer streaming failed: " + (err.message || err));
    }
  }
}

export default Summariser;

export { Summariser };
