import { getRandomInt } from './crypto';
import { ZapidResult, ZapidValidationError, SafetyLevel } from '../types';

/**
 * Constants for ID generation
 */
const CONSTANTS = {
    DEFAULT_LENGTH: 7,
    MIN_LENGTH: 7,
    MAX_LENGTH: 32,
    CHARSET: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
} as const;

/**
 * Interface for collision probability thresholds
 */
interface CollisionThresholds {
    safe: number;
    moderate: number;
}

/**
 * Thresholds for collision probability classifications
 */
const COLLISION_THRESHOLDS: CollisionThresholds = {
    safe: 0.001, // 0.1%
    moderate: 0.1, // 10%
};

/**
 * Mapping of safety levels to their recommendation message functions
 */
const SAFETY_RECOMMENDATIONS: Record<SafetyLevel, (combinations: number) => string> = {
    'safe': (combinations) =>
        `Safe for up to 100k IDs. Total possible combinations: ${combinations.toExponential(2)}`,
    'moderate': () =>
        `Moderate collision risk. Consider increasing length for large-scale use.`,
    'high-risk': () =>
        `High collision risk. Increase length or reduce number of IDs.`
};

/**
 * Validates the input length for ID generation
 * @param {number} length - The requested ID length
 * @throws {ZapidValidationError} If length is invalid
 */
const validateLength = (length: number): void => {
    if (!Number.isInteger(length)) {
        throw new ZapidValidationError('ID length must be an integer');
    }

    if (length < CONSTANTS.MIN_LENGTH) {
        throw new ZapidValidationError(
            `ID length must be at least ${CONSTANTS.MIN_LENGTH} characters`
        );
    }

    if (length > CONSTANTS.MAX_LENGTH) {
        throw new ZapidValidationError(
            `ID length cannot exceed ${CONSTANTS.MAX_LENGTH} characters`
        );
    }
};

/**
 * Calculates collision probability for given length and expected number of IDs
 * Uses the birthday problem probability formula
 * @param {number} length - The ID length
 * @param {number} numIds - Expected number of IDs (default: 100000)
 * @returns {number} Collision probability as a decimal
 * @example
 * const probability = calculateCollisionProbability(7, 100000);
 * // Returns collision probability for 7-character IDs with 100k IDs
 */
const calculateCollisionProbability = (length: number, numIds: number = 100000): number => {
    const space = Math.pow(CONSTANTS.CHARSET.length, length);
    // Using approximation of birthday problem formula for large numbers
    const exponent = (-numIds * (numIds - 1)) / (2 * space);
    return 1 - Math.exp(exponent);
};

/**
 * Determines safety level based on collision probability
 * @param {number} probability - The calculated collision probability
 * @returns {SafetyLevel} The safety classification
 * @example
 * const safety = getSafetyLevel(0.05);
 * // Returns 'moderate' as 0.05 is between safe (0.001) and moderate (0.1) thresholds
 */
const getSafetyLevel = (probability: number): SafetyLevel => {
    if (probability >= COLLISION_THRESHOLDS.moderate) return 'high-risk';
    if (probability >= COLLISION_THRESHOLDS.safe) return 'moderate';
    return 'safe';
};

/**
 * Generates a recommendation based on ID length and safety level
 * @param {number} length - The ID length
 * @param {SafetyLevel} safety - The calculated safety level
 * @returns {string} A human-readable recommendation
 * @example
 * const recommendation = getRecommendation(7, 'safe');
 * // Returns recommendation with combination count for safe level
 */
const getRecommendation = (length: number, safety: SafetyLevel): string => {
    const combinations = Math.pow(CONSTANTS.CHARSET.length, length);
    return SAFETY_RECOMMENDATIONS[safety](combinations);
};

/**
 * Generates a random ID of specified length
 * @param {number} [length=CONSTANTS.DEFAULT_LENGTH] - The desired length of the ID
 * @returns {string} The generated ID
 * @throws {ZapidValidationError} If length is invalid
 * @example
 * const id = generate(); // Returns 7-character ID
 * const id = generate(12); // Returns 12-character ID
 */
export const generate = (length: number = CONSTANTS.DEFAULT_LENGTH): string => {
    validateLength(length);

    let id = '';
    const charsetLength = CONSTANTS.CHARSET.length;

    for (let i = 0; i < length; i++) {
        const randomIndex = getRandomInt(charsetLength);
        id += CONSTANTS.CHARSET[randomIndex];
    }

    return id;
};

/**
 * Generates a random ID with additional safety information
 * @param {number} [length=CONSTANTS.DEFAULT_LENGTH] - The desired length of the ID
 * @returns {ZapidResult} Object containing ID and safety information
 * @throws {ZapidValidationError} If length is invalid
 * @example
 * const result = generateWithInfo();
 * // Returns { id: "aB2x9qL", safety: "safe", collisionProbability: "0.001%", ... }
 */
export const generateWithInfo = (length: number = CONSTANTS.DEFAULT_LENGTH): ZapidResult => {
    validateLength(length);

    const id = generate(length);
    const probability = calculateCollisionProbability(length);
    const safety = getSafetyLevel(probability);

    return {
        id,
        safety,
        collisionProbability: `${(probability * 100).toFixed(3)}%`,
        recommendation: getRecommendation(length, safety)
    };
};

/**
 * Gets the current character set used for ID generation
 * @returns {string} The current character set
 * @example
 * const charset = getCharset(); // Returns "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
 */
export const getCharset = (): string => CONSTANTS.CHARSET;

/**
 * Gets the default configuration values
 * @returns {Readonly<typeof CONSTANTS>} The constant values used by the generator
 * @example
 * const config = getConfig();
 * // Returns { DEFAULT_LENGTH: 7, MIN_LENGTH: 7, MAX_LENGTH: 32, ... }
 */
export const getConfig = (): Readonly<typeof CONSTANTS> => Object.freeze({ ...CONSTANTS });