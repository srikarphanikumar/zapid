export const randomBytes = (size: number): Buffer => {
    const arr = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
        arr[i] = i % 256; // Deterministic pattern for testing
    }
    return Buffer.from(arr);
};