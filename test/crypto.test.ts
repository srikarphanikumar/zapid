import { getRandomBytes, getRandomInt, CryptoGenerationError } from '../src/zapid/crypto';

// Create a sequence generator for deterministic but different values
let sequence = 0;
const getNextSequence = () => {
    sequence = (sequence + 1) % 256;
    return sequence;
};

// Mock crypto module
jest.mock('crypto', () => ({
    randomBytes: (size: number) => {
        const arr = new Uint8Array(size);
        for (let i = 0; i < size; i++) {
            arr[i] = getNextSequence();
        }
        return Buffer.from(arr);
    }
}));

describe('Crypto Utils', () => {
    beforeEach(() => {
        // Reset sequence before each test
        sequence = 0;
        // Clear window mock
        delete (global as any).window;
    });

    describe('getRandomBytes', () => {
        test('generates correct length of bytes', () => {
            const lengths = [1, 16, 32, 64];
            lengths.forEach(length => {
                const bytes = getRandomBytes(length);
                expect(bytes.length).toBe(length);
                expect(bytes instanceof Uint8Array).toBe(true);
            });
        });

        test('generates different values on subsequent calls', () => {
            // Create a mock that returns incrementing values
            const mockGetRandomValues = jest.fn().mockImplementation((array: Uint8Array) => {
                for (let i = 0; i < array.length; i++) {
                    array[i] = getNextSequence();
                }
                return array;
            });

            (global as any).window = {
                crypto: { getRandomValues: mockGetRandomValues }
            };

            const bytes1 = getRandomBytes(3);
            const bytes2 = getRandomBytes(3);

            // Convert to arrays for easier debugging
            const arr1 = Array.from(bytes1);
            const arr2 = Array.from(bytes2);

            expect(arr1).not.toEqual(arr2);
            expect(mockGetRandomValues).toHaveBeenCalledTimes(2);
        });

        test('throws error for invalid length', () => {
            const invalidLengths = [0, -1, 1.5, NaN, Infinity];
            invalidLengths.forEach(length => {
                expect(() => getRandomBytes(length)).toThrow(CryptoGenerationError);
            });
        });
    });

    describe('getRandomInt', () => {
        test('generates numbers within specified range', () => {
            const max = 10;
            const results = new Set();

            // Mock random bytes to ensure different values
            const mockRandomBytes = jest.fn().mockImplementation((size: number) => {
                const arr = new Uint8Array(size);
                for (let i = 0; i < size; i++) {
                    arr[i] = getNextSequence();
                }
                return arr;
            });

            // Mock Node.js crypto module
            jest.mock('crypto', () => ({
                randomBytes: mockRandomBytes
            }));

            // Generate multiple values
            for (let i = 0; i < 10; i++) {
                const num = getRandomInt(max);
                expect(num).toBeGreaterThanOrEqual(0);
                expect(num).toBeLessThan(max);
                results.add(num);
            }

            expect(results.size).toBeGreaterThan(2);
        });

        test('handles edge case of max=1', () => {
            const result = getRandomInt(1);
            expect(result).toBe(0);
        });

        test('throws error for invalid max values', () => {
            const invalidMaxes = [0, -1, 1.5, NaN, Infinity];
            invalidMaxes.forEach(max => {
                expect(() => getRandomInt(max)).toThrow(CryptoGenerationError);
            });
        });
    });

    describe('Environment Detection', () => {
        let mockGetRandomValues: jest.Mock;

        beforeEach(() => {
            mockGetRandomValues = jest.fn().mockImplementation((array: Uint8Array) => {
                for (let i = 0; i < array.length; i++) {
                    array[i] = getNextSequence();
                }
                return array;
            });
        });

        test('uses browser crypto when available', () => {
            (global as any).window = {
                crypto: { getRandomValues: mockGetRandomValues }
            };

            const bytes = getRandomBytes(4);
            expect(mockGetRandomValues).toHaveBeenCalled();
            expect(bytes.length).toBe(4);
        });

        test('falls back to Node.js crypto when window.crypto is not available', () => {
            const bytes = getRandomBytes(4);
            expect(bytes.length).toBe(4);
        });

        test('handles crypto generation failures', () => {
            (global as any).window = {
                crypto: {
                    getRandomValues: () => {
                        throw new Error('Crypto generation failed');
                    }
                }
            };

            expect(() => getRandomBytes(4)).toThrow(CryptoGenerationError);
        });
    });
});