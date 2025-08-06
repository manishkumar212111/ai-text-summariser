import { SummariserConfig, SummariserError } from './types';

export class Summariser {
    private config: Required<SummariserConfig>;
    private abortController: AbortController;

    // Add static methods for API calls
    private static async availability(options: { type: string; format: string }) {
        // TODO: Implement actual API call
        return { available: true };
    }

    private static async summarize(options: {
        text: string;
        context?: string | null;
        type: string;
        format: string;
        length: string;
        signal: AbortSignal;
    }) {
        // TODO: Implement actual API call
        return 'Summarized text';
    }

    private static async summarizeStreaming(options: {
        text: string;
        context?: string | null;
        type: string;
        format: string;
        length: string;
        signal: AbortSignal;
    }) {
        // TODO: Implement actual API call
        return []; // Replace with actual stream
    }

    /**
     * Creates an instance of the Summariser.
     * @param {SummariserConfig} [config={}] - Configuration options for the summariser.
     */
    constructor(config: SummariserConfig = {}) {
        this.config = {
            type: config.type || 'tldr',
            format: config.format || 'plain-text',
            length: config.length || 'medium',
            expectedInputLanguages: config.expectedInputLanguages || ['en'],
            expectedContextLanguages: config.expectedContextLanguages || ['en'],
            outputLanguage: config.outputLanguage || 'en',
            streaming: config.streaming || false,
            sharedContext: config.sharedContext || null
        };
        this.abortController = new AbortController();
    }

    /**
     * Checks the availability of the summariser service.
     * @returns {Promise<boolean>} - Returns true if the service is available, otherwise throws an error.
     */
    async checkAvailability(): Promise<boolean> {
        try {
            const response = await Summariser.availability({
                type: this.config.type,
                format: this.config.format
            });

            if (!response.available) {
                throw new SummariserError(`Summarizer not available`);
            }

            return true;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new SummariserError(`Service unavailable: ${message}`);
        }
    }

    /**
     * Summarizes the given text.
     * @param {string} text - The text to summarize.
     * @param {string} [context] - Optional context to consider during summarization.
     * @returns {Promise<string>} - The summarized text.
     */
    async summarise(text: string, context?: string): Promise<string> {
        await this.checkAvailability();

        if (!this.config.streaming) {
            try {
                const result = await Summariser.summarize({
                    text,
                    context: context ?? this.config.sharedContext,
                    type: this.config.type,
                    format: this.config.format,
                    length: this.config.length,
                    signal: this.abortController.signal
                });
                return result;
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error);
                throw new SummariserError(`Summarization failed: ${message}`);
            }
        } else {
            throw new SummariserError('Use summariseStream() for streaming mode');
        }
    }

    /**
     * Streams the summarization of the given text.
     * @param {string} text - The text to summarize.
     * @param {string} [context] - Optional context to consider during summarization.
     * @returns {AsyncGenerator<string>} - An async generator that yields chunks of the summarized text.
     */
    async *summariseStream(text: string, context?: string): AsyncGenerator<string> {
        await this.checkAvailability();

        if (this.config.streaming) {
            try {
                const stream = await Summariser.summarizeStreaming({
                    text,
                    context: context ?? this.config.sharedContext,
                    type: this.config.type,
                    format: this.config.format,
                    length: this.config.length,
                    signal: this.abortController.signal
                });

                for await (const chunk of stream) {
                    yield chunk;
                }
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error);
                throw new SummariserError(`Streaming summarization failed: ${message}`);
            }
        } else {
            throw new SummariserError('Streaming mode is not enabled');
        }
    }

    /**
     * Aborts the ongoing summarization process.
     */
    abort(): void {
        this.abortController.abort();
        this.abortController = new AbortController();
    }
}

export * from './types';
