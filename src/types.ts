export type SummaryType = 'headline' | 'key-points' | 'teaser' | 'tldr';
export type OutputFormat = 'plain-text' | 'markdown';
export type SummaryLength = 'short' | 'medium' | 'long';

export interface SummariserConfig {
    type?: SummaryType;
    format?: OutputFormat;
    length?: SummaryLength;
    expectedInputLanguages?: string[];
    expectedContextLanguages?: string[];
    outputLanguage?: string;
    streaming?: boolean;
    sharedContext?: string | null;
}

export interface SummarizerAvailabilityResponse {
    available: boolean;
    reason?: string;
}

export class SummariserError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SummariserError';
    }
}
