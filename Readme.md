# ai-text-summariser

`ai-text-summariser` is a **JavaScript wrapper** for the browser's `Summarizer` API, providing **streaming** and **non-streaming** AI-powered text summarization in a consistent, developer-friendly way.

Supports:
- **Types**: headline, key-points, teaser, tldr
- **Formats**: plain-text, markdown
- **Lengths**: short, medium, long
- **Streaming** and **non-streaming** modes
- Automatic **availability check**
- Chrome **v138+ compatibility check**
- Custom **progress monitoring** and **AbortController** support

---

## 🚀 Installation

```bash
npm install ai-text-summariser
```

## 🛠 Requirements

- **Browser**: Chrome v138 or newer
  (due to dependency on the built-in Summarizer API introduced in Chrome 138)

- **JavaScript environment**: Browser context (Node is supported only for testing availability and config validation; summarization will not work in Node without a polyfill).

- **Experimental AI APIs enabled** (in Chrome flags, depending on your build):
  - `chrome://flags/#enable-ai-features`
  - `chrome://flags/#summarizer-api`

## 📦 Importing

```js
import Summariser from 'ai-text-summariser';
// or
const Summariser = require('ai-text-summariser').default;
```

## ⚙️ Configuration

The constructor accepts a config object:

```ts
{
  type?: 'headline' | 'key-points' | 'teaser' | 'tldr'; // default: 'headline'
  format?: 'plain-text' | 'markdown';                   // default: 'plain-text'
  length?: 'short' | 'medium' | 'long';                  // default: 'medium'
  expectedInputLanguages?: string[];                     // default: ['en']
  expectedContextLanguages?: string[];                   // default: ['en']
  outputLanguage?: string;                               // default: 'en'
  streaming?: boolean;                                   // default: false
  sharedContext?: string | null;                         // default: null
  monitor?: (monitorObj: any) => void;                   // optional
  signal?: AbortSignal;                                  // optional
}
```

### Defaults
If you omit a property, the default will be applied automatically.

## 📋 API Reference

### Class: Summariser

#### `constructor(config?: SummariserConfig)`
Create a new summariser instance with optional config.

#### `async checkAvailability(): Promise<boolean>`
Checks:
- Chrome version (throws error if <138)
- Summarizer API availability for given config

#### `async summarise(text: string, context?: string): Promise<string>`
Performs non-streaming summarisation and returns the full result as a string.

#### `async *summariseStream(text: string, context?: string): AsyncIterable<string>`
Performs streaming summarisation, yielding chunks as they arrive.

## 📄 Example Usage

### 1. Non-streaming headline

```js
import Summariser from 'ai-text-summariser';

(async () => {
  const summariser = new Summariser({
    type: 'headline',
    format: 'plain-text',
    length: 'short'
  });

  if (!(await summariser.checkAvailability())) {
    console.error('Summarizer not available in this browser.');
    return;
  }

  const result = await summariser.summarise(
    'Your long article text goes here...',
    'Story'
  );
  
  console.log('Summary:', result);
})();
```

### 2. Streaming key-points

```js
import Summariser from 'ai-text-summariser';

(async () => {
  const summariser = new Summariser({
    type: 'key-points',
    format: 'markdown',
    length: 'long',
    streaming: true,
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        console.log(`Downloaded ${(e.loaded * 100).toFixed(2)}%`);
      });
    }
  });

  if (!(await summariser.checkAvailability())) {
    console.error('Summarizer not available.');
    return;
  }

  let output = '';
  for await (const chunk of summariser.summariseStream(
    'Your long text here...',
    'Article'
  )) {
    output += chunk;
    process.stdout.write(chunk); // live output
  }

  console.log('\nFinal summary:', output);
})();
```

### 3. Aborting a request

```js
const abortController = new AbortController();

const summariser = new Summariser({
  type: 'tldr',
  streaming: false,
  signal: abortController.signal
});

setTimeout(() => abortController.abort(), 2000); // cancel after 2s
```

## 🔍 Availability Check

Before calling `summarise` or `summariseStream`, always do:

```js
if (!(await summariser.checkAvailability())) {
  console.error('Summarizer not available for this config.');
  return;
}
```

If the API is not available, you can:
- Show a fallback UI
- Use a server-based summarisation API
- Ask user to upgrade Chrome to v138+

## ⚠️ Error Handling

`ai-text-summariser` throws descriptive errors for:
- **Invalid config**: Unsupported type, format, length
- **Browser compatibility**: Chrome version < 138
- **API unavailability**: Summarizer API not exposed
- **Summarisation failures**: Errors from Summarizer.create() or during summarization

Example:

```js
try {
  const result = await summariser.summarise(text);
} catch (err) {
  console.error('Summarisation failed:', err.message);
}
```

## 📌 Chrome v138+ Requirement

`ai-text-summariser` will not work in:
- Older versions of Chrome (<138)
- Non-Chromium browsers (unless they implement Summarizer API)
- Headless Chrome without AI APIs enabled

To check your Chrome version:
1. Go to `chrome://version/`
2. Ensure "Google Chrome" shows 138.x.x.x or newer.

## 📚 Further Notes

- **For developers**: This package assumes a modern JS environment and does not polyfill the Summarizer API.
- **For Node.js**: You can import and use `checkAvailability()` and config validation, but summarisation methods require a browser.