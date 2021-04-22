
export interface CryptoImpl {
    encrypt(data: string, pin: string): Promise<string>;
    decrypt(data: string, pin: string): Promise<string>;
}