declare module 'ai-text-summariser' {
    export interface SummariserConfig {
        type?: 'tldr' | 'summary' | 'key-points';
        format?: 'plain-text' | 'markdown' | 'html';
        length?: 'short' | 'medium' | 'long';
        expectedInputLanguages?: string[];
        expectedContextLanguages?: string[];
        outputLanguage?: string;
        streaming?: boolean;
        sharedContext?: string | null;
    }

    export class Summariser {
        constructor(config?: SummariserConfig);
        checkAvailability(): Promise<boolean>;
        summarise(text: string, context?: string): Promise<string>;
        summariseStream(text: string, context?: string): AsyncGenerator<string>;
        abort(): void;
    }

    export class SummariserError extends Error {
        constructor(message: string);
    }
}
