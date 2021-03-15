import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
// pedro-arruda-moreira: changed client
import { IVaultDBEntryImproved } from 'improved-vaultage-client';

import { AuthService } from '../auth.service';

// pedro-arruda-moreira: changed client
@Injectable()
export class VaultEntryResolver implements Resolve<IVaultDBEntryImproved> {

    constructor(
            private readonly authService: AuthService,
            private readonly router: Router) { }
	// pedro-arruda-moreira: changed client
    async resolve(route: ActivatedRouteSnapshot): Promise<IVaultDBEntryImproved> {
        const id = route.paramMap.get('id');
        if (id == null) {
            throw new Error('No id parameter provided');
        }
        try {
            return this.authService.getVault().getEntry(id);
        } catch (e) {
            await this.router.navigate(['/manager']);
            throw e;
        }
      }
}
