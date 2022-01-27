export function isValidOperationHash(hash: string): boolean {
    return hash.length === 51 && hash.startsWith('o');
}