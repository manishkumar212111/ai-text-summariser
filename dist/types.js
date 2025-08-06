"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummariserError = void 0;
class SummariserError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SummariserError';
    }
}
exports.SummariserError = SummariserError;
