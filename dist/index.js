"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Summariser = void 0;
const types_1 = require("./types");
class Summariser {
    // Add static methods for API calls
    static async availability(options) {
        // TODO: Implement actual API call
        return { available: true };
    }
    static async summarize(options) {
        // TODO: Implement actual API call
        return 'Summarized text';
    }
    static async summarizeStreaming(options) {
        // TODO: Implement actual API call
        return []; // Replace with actual stream
    }
    /**
     * Creates an instance of the Summariser.
     * @param {SummariserConfig} [config={}] - Configuration options for the summariser.
     */
    constructor(config = {}) {
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
    async checkAvailability() {
        try {
            const response = await Summariser.availability({
                type: this.config.type,
                format: this.config.format
            });
            if (!response.available) {
                throw new types_1.SummariserError(`Summarizer not available`);
            }
            return true;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new types_1.SummariserError(`Service unavailable: ${message}`);
        }
    }
    /**
     * Summarizes the given text.
     * @param {string} text - The text to summarize.
     * @param {string} [context] - Optional context to consider during summarization.
     * @returns {Promise<string>} - The summarized text.
     */
    async summarise(text, context) {
        await this.checkAvailability();
        if (!this.config.streaming) {
            try {
                const result = await Summariser.summarize({
                    text,
                    context: context !== null && context !== void 0 ? context : this.config.sharedContext,
                    type: this.config.type,
                    format: this.config.format,
                    length: this.config.length,
                    signal: this.abortController.signal
                });
                return result;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                throw new types_1.SummariserError(`Summarization failed: ${message}`);
            }
        }
        else {
            throw new types_1.SummariserError('Use summariseStream() for streaming mode');
        }
    }
    /**
     * Streams the summarization of the given text.
     * @param {string} text - The text to summarize.
     * @param {string} [context] - Optional context to consider during summarization.
     * @returns {AsyncGenerator<string>} - An async generator that yields chunks of the summarized text.
     */
    async *summariseStream(text, context) {
        await this.checkAvailability();
        if (this.config.streaming) {
            try {
                const stream = await Summariser.summarizeStreaming({
                    text,
                    context: context !== null && context !== void 0 ? context : this.config.sharedContext,
                    type: this.config.type,
                    format: this.config.format,
                    length: this.config.length,
                    signal: this.abortController.signal
                });
                for await (const chunk of stream) {
                    yield chunk;
                }
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                throw new types_1.SummariserError(`Streaming summarization failed: ${message}`);
            }
        }
        else {
            throw new types_1.SummariserError('Streaming mode is not enabled');
        }
    }
    /**
     * Aborts the ongoing summarization process.
     */
    abort() {
        this.abortController.abort();
        this.abortController = new AbortController();
    }
}
exports.Summariser = Summariser;
__exportStar(require("./types"), exports);
