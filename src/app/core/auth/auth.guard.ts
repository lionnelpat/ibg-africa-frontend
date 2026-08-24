import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AccountService } from './account.service';

export const authGuard: CanActivateFn = async () => {
    const accountService = inject(AccountService);
    await accountService.load();

    if (accountService.authenticated()) {
        return true;
    }

    accountService.login();
    return false;
};
