import { SummariserConfig } from './types';
export declare class Summariser {
    private config;
    private abortController;
    private static availability;
    private static summarize;
    private static summarizeStreaming;
    /**
     * Creates an instance of the Summariser.
     * @param {SummariserConfig} [config={}] - Configuration options for the summariser.
     */
    constructor(config?: SummariserConfig);
    /**
     * Checks the availability of the summariser service.
     * @returns {Promise<boolean>} - Returns true if the service is available, otherwise throws an error.
     */
    checkAvailability(): Promise<boolean>;
    /**
     * Summarizes the given text.
     * @param {string} text - The text to summarize.
     * @param {string} [context] - Optional context to consider during summarization.
     * @returns {Promise<string>} - The summarized text.
     */
    summarise(text: string, context?: string): Promise<string>;
    /**
     * Streams the summarization of the given text.
     * @param {string} text - The text to summarize.
     * @param {string} [context] - Optional context to consider during summarization.
     * @returns {AsyncGenerator<string>} - An async generator that yields chunks of the summarized text.
     */
    summariseStream(text: string, context?: string): AsyncGenerator<string>;
    /**
     * Aborts the ongoing summarization process.
     */
    abort(): void;
}
export * from './types';
