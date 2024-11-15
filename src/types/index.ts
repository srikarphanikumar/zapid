export type SafetyLevel = 'safe' | 'moderate' | 'high-risk';

export interface ZapidResult {
    id: string;
    safety: SafetyLevel;
    collisionProbability: string;
    recommendation: string;
}

export interface ZapidOptions {
    length?: number;
}

// Error classes for better error handling
export class ZapidError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ZapidError';
    }
}

export class ZapidValidationError extends ZapidError {
    constructor(message: string) {
        super(message);
        this.name = 'ZapidValidationError';
    }
}