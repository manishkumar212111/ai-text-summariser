# ai-text-summariser

`ai-text-summariser` is a **JavaScript wrapper** for the browser's `Summarizer` API, providing **streaming** and **non-streaming** AI-powered text summarization in a consistent, developer-friendly way.

## ⚡ Quick Start

```javascript
import { Summariser } from 'ai-text-summariser';

// Create summariser
const summariser = new Summariser({
  type: 'tldr',
  format: 'plain-text'
});

// Check availability & summarize
async function summarize(text) {
  if (await summariser.checkAvailability()) {
    const summary = await summariser.summarise(text);
    console.log('Summary:', summary);
  }
}
```

## ✨ Features

Supports:
- **Types**: headline, key-points, teaser, tldr
- **Formats**: plain-text, markdown
- **Lengths**: short, medium, long
- **Streaming** and **non-streaming** modes
- Automatic **availability check**
- Chrome **v138+ compatibility check**
- Custom **progress monitoring** and **AbortController** support

## 🚀 Installation

```bash
npm install ai-text-summariser
```

## 🛠 Requirements

- **Node.js**: v14 or later
- **Browser**: Latest version of Chrome, Firefox, or Safari

## 📦 Usage

### ESM Import
```javascript
import { Summariser } from 'ai-text-summariser';
```

### CommonJS Require
```javascript
const { Summariser } = require('ai-text-summariser');
```

### Basic Example
```javascript
const summariser = new Summariser({
  type: 'headline',
  format: 'plain-text',
  length: 'short'
});

try {
  const summary = await summariser.summarise('Your text here');
  console.log(summary);
} catch (error) {
  console.error('Summarization failed:', error.message);
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © [Manish Kumar](https://github.com/manishkumar212111)
