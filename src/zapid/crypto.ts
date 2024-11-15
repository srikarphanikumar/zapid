import { ZapidError } from '../types';

/**
 * Interface for the browser's crypto object to ensure type safety
 */
interface WebCrypto {
    getRandomValues<T extends ArrayBufferView>(array: T): T;
}

/**
 * Interface for the Node.js crypto module to ensure type safety
 */
interface NodeCrypto {
    randomBytes(size: number): Buffer;
}

/**
 * Error thrown when crypto operations fail
 */
export class CryptoGenerationError extends ZapidError {
    constructor(message: string) {
        super(message);
        this.name = 'CryptoGenerationError';
    }
}

/**
 * Checks if code is running in a browser environment
 * @returns {boolean} True if in browser, false if in Node.js
 */
const isBrowser = (): boolean => {
    return typeof window !== 'undefined' && typeof window.crypto !== 'undefined';
};

/**
 * Gets the appropriate crypto implementation based on the environment
 * @returns {WebCrypto | NodeCrypto} The crypto implementation
 * @throws {CryptoGenerationError} If no secure crypto implementation is available
 * @example
 * const crypto = getCrypto();
 * // In Node.js: Returns Node's crypto module
 * // In Browser: Returns window.crypto
 */
const getCrypto = (): WebCrypto | NodeCrypto => {
    if (isBrowser()) {
        return window.crypto;
    }

    try {
        return require('crypto');
    } catch (error) {
        throw new CryptoGenerationError(
            'No secure crypto implementation available. Ensure you are in a supported environment.'
        );
    }
};

/**
 * Generates cryptographically secure random bytes
 * @param {number} length The number of random bytes to generate
 * @returns {Uint8Array} Array of random bytes
 * @throws {CryptoGenerationError} If random bytes generation fails
 * @example
 * const bytes = getRandomBytes(16);
 * // Returns Uint8Array(16) [...]
 */
export const getRandomBytes = (length: number): Uint8Array => {
    if (!Number.isInteger(length) || length < 1) {
        throw new CryptoGenerationError(
            'Random bytes length must be a positive integer'
        );
    }

    try {
        const crypto = getCrypto();

        if (isBrowser()) {
            const bytes = new Uint8Array(length);
            (crypto as WebCrypto).getRandomValues(bytes);
            return bytes;
        } else {
            const buffer = (crypto as NodeCrypto).randomBytes(length);
            return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        }
    } catch (error) {
        throw new CryptoGenerationError(
            `Failed to generate random bytes: ${(error as Error).message}`
        );
    }
};

/**
 * Generates a random number between 0 and max (exclusive) using crypto
 * Implements protection against modulo bias
 * @param {number} max The exclusive upper bound
 * @returns {number} A random number between 0 and max (exclusive)
 * @throws {CryptoGenerationError} If random number generation fails
 * @example
 * const num = getRandomInt(62);
 * // Returns a number between 0 and 61
 */
export const getRandomInt = (max: number): number => {
    if (!Number.isInteger(max) || max < 1) {
        throw new CryptoGenerationError(
            'Maximum value must be a positive integer'
        );
    }

    // Special case for max=1
    if (max === 1) {
        return 0;
    }

    // Calculate number of bits needed to represent max
    const bitsNeeded = Math.ceil(Math.log2(max));
    const bytesNeeded = Math.ceil(bitsNeeded / 8);

    // Calculate the mask for removing modulo bias
    const mask = (1 << bitsNeeded) - 1;

    // Generate random numbers until we get one in the valid range
    while (true) {
        const bytes = getRandomBytes(bytesNeeded);
        let num = 0;

        // Combine bytes into a number
        for (let i = 0; i < bytesNeeded; i++) {
            num = (num << 8) | bytes[i];
        }

        // Apply mask to get only the bits we need
        num = num & mask;

        // If the number is in valid range, return it
        if (num < max) {
            return num;
        }
        // Otherwise, try again to avoid modulo bias
    }
};