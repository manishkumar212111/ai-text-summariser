# AI Text Summariser

A TypeScript wrapper for the Summarizer API with streaming support.

## Installation

```bash
npm install ai-text-summariser
```

## API Reference

### Configuration

```typescript
interface SummariserConfig {
  type?: 'headline' | 'key-points' | 'teaser' | 'tldr';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
  expectedInputLanguages?: string[];
  expectedContextLanguages?: string[];
  outputLanguage?: string;
  streaming?: boolean;
  sharedContext?: string | null;
}
```

### Methods

- `checkAvailability()`: Checks if the API is available
- `summarise(text: string, context?: string)`: Synchronous summarization
- `summariseStream(text: string, context?: string)`: Streaming summarization
- `abort()`: Cancels ongoing summarization

## Usage Examples

### Basic Usage (JavaScript)

```javascript
const { Summariser } = require('ai-text-summariser');

// Create a basic summariser with default settings
const summariser = new Summariser();

async function summarizeText() {
  try {
    const result = await summariser.summarise('Your text here');
    console.log(result);
  } catch (error) {
    console.error('Summarization failed:', error.message);
  }
}
```

### Advanced Usage (TypeScript)

```typescript
import { Summariser, SummariserConfig } from 'ai-text-summariser';

const config: SummariserConfig = {
  type: 'key-points',
  format: 'markdown',
  length: 'medium',
  expectedInputLanguages: ['en', 'es'],
  outputLanguage: 'en',
  streaming: false
};

const summariser = new Summariser(config);

// With shared context
const context = "This is background information that helps with summarization";
const result = await summariser.summarise('Your text here', context);
```

### Streaming Example with Error Handling

```typescript
const streamingSummariser = new Summariser({
  type: 'tldr',
  format: 'plain-text',
  streaming: true
});

try {
  // Check API availability before starting
  await streamingSummariser.checkAvailability();

  for await (const chunk of streamingSummariser.summariseStream('Your text here')) {
    process.stdout.write(chunk);
    
    // To cancel the stream at any point
    // streamingSummariser.abort();
  }
} catch (error) {
  console.error('Streaming failed:', error.message);
}
```

### With Custom Error Handling

```typescript
import { Summariser, SummariserError } from 'ai-text-summariser';

async function safeSummarize(text: string) {
  const summariser = new Summariser();
  
  try {
    await summariser.checkAvailability();
    return await summariser.summarise(text);
  } catch (error) {
    if (error instanceof SummariserError) {
      // Handle specific summariser errors
      console.error('Summariser error:', error.message);
    } else {
      // Handle other errors
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}
```

## Requirements

- Node.js 14+
- Chrome v138+

## Error Handling

The package throws `SummariserError` for:
- Service unavailability
- Invalid configuration
- Failed summarization attempts

Best practice is to always check availability before using the service:

```typescript
const summariser = new Summariser();

try {
  // Always check availability first
  await summariser.checkAvailability();
  const result = await summariser.summarise('Your text here');
} catch (error) {
  console.error('Service error:', error.message);
}
```
