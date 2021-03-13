
export interface CryptoImpl {
    encrypt(data: string, pin: string): string;
    decrypt(data: string, pin: string): string;
}