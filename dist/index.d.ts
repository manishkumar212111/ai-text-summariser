export type SummariserConfig = {
  type?: 'headline' | 'key-points' | 'teaser' | 'tldr';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
  expectedInputLanguages?: string[];
  expectedContextLanguages?: string[];
  outputLanguage?: string;
  streaming?: boolean;
  sharedContext?: string | null;
  monitor?: (m: any) => void;
  signal?: AbortSignal | null;
};

export default class Summariser {
  constructor(config?: SummariserConfig);
  checkAvailability(): Promise<boolean>;
  summarise(text: string, context?: string): Promise<string>;
  summariseStream(text: string, context?: string): AsyncIterable<string>;
}
