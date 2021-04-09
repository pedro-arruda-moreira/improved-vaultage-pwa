import { IVaultDBEntryAttrsImproved } from 'improved-vaultage-client';

/**
 * A complete entry in the vault database
 */
export interface PasswordEntry {
    title: string;
    id: string;
    // pedro-arruda-moreira: changed client
    itemUrl: string;
    login: string;
    password: string;
    // pedro-arruda-moreira: secure notes
    secureNoteText: string;
    isDelete?: boolean;
}
// pedro-arruda-moreira: changed client
export function toVaultageEntry(pwEntry: PasswordEntry): IVaultDBEntryAttrsImproved {
    // The conversion is trivial because our domain model is very similar to the vaultage DTO.
    // However, this function is required to make sure that our model is type-compatible with that of Vaultage.
    return { ...pwEntry };
}
