# PROJECT OVERVIEW — improved-vaultage-pwa

## What it is
PWA Angular 9 for self-hosted password management. Fork of [vaultage-pm/vaultage](https://github.com/vaultage-pm/vaultage) with fixes and improvements from the author.

**Version:** 4.4.2 | **License:** GPL-2.0 | **Runtime:** Service Worker (ngsw)

---

## Navigation flow
```
/              → manager (redirect)
/setup         → SetupComponent    (canActivate: UnauthGuard)
/unlock        → UnlockScreenComp  (canActivate: LockScreenGuard)
/manager       → ManagerComponent  (canActivate: AuthGuard)
  /            → HomeComponent
  /create      → CreatePasswordComponent
  /view/:id    → ViewPasswordComponent      (resolve: VaultEntryResolver)
  /edit/:id    → EditPasswordComponent      (resolve: VaultEntryResolver)
```

---

## Architecture

### Authentication flow
1. **Setup** (`/setup`): 2-step wizard — login to server → PIN creation
2. **Login** (`auth.service.ts`): `doLogin()` connects to Vaultage server via `improved-vaultage-client`
3. **PIN lock** (`pin-lock.service.ts`): Encrypted PIN stored in localStorage; each reload requires unlock
4. **Lock screen** (`/unlock`): Unlock screen when PIN is configured but user is not authenticated
5. **Logout** (`auth.service.logOut()`): clears vault subject, closes dialogs

### Access control
`access-control.service.ts` centralizes zone-based access decisions:
- **manager** → `authService.isAuthenticated`
- **setup** → not authenticated AND no PIN configured
- **unlock-screen** → not authenticated AND PIN configured

### Cryptography (3 layers)
| Layer | Component |
|---|---|
| Interface | `CryptoImpl` — `encrypt(data, pin)` / `decrypt(data, pin)` |
| Local | `OfflineCrypto` — uses Web Crypto API (subtleCrypto) |
| Remote | `OnlineCrypto` — delegates cryptography to server |

Factory in `root-providers.ts` chooses impl based on `FEATURE_CRYPTO_TYPE` in localStorage.

**Default parameters:** PBKDF2, 1M iterations, GCM mode, 256-bit key, AD = 'vaultage'

### Offline mode
`offline.service.ts` implements `IOfflineProvider`:
- Listens to `online`/`offline` events from browser
- When goes offline: saves cipher in localStorage, allows access with local PIN
- When comes back online: forces logout (relogin required)
- Flag: `FEATURE_OFFLINE_ENABLED` in localStorage

### Desktop mode
When `FEATURE_DESKTOP == 'true'`:
- PIN is always requested via `/unlock` — same behavior as non-desktop (current behavior is correct)
- On login (`auth.service.logIn`): asks for master password via dialog and caches it in memory (one session)
- Master password is **not** saved anywhere — cleared on reset/logOut
- `changeMasterPassword`: confirms current master password → new → confirms new

---

## Services by responsibility

| Service | Responsibility |
|---|---|
| `AuthService` | Auth state (BehaviorSubject<Vault>), login/logout, vault CRUD |
| `PinLockService` | Lock/unlock with PIN, crypt storage |
| `SetupService` | Orchestrates setup wizard (credentials → PIN) |
| `AccessControlService` | Zone-based gatekeeper |
| `OfflineService` | Offline cryptography provider, connectivity detection |
| `RedirectService` | Redirect helpers between auth zones |
| `AutoLogoutService` | Automatic session timeout |
| `AutoRedirectService` | Automatic redirect based on state |
| `BusyStateService` | Global loading indicator |
| `ErrorHandlingService` | Centralized error handling |
| `LocalStorageConfigCache` | Server config cache in localStorage |

### Feature flags (localStorage)
| Flag | Value | Effect |
|---|---|---|
| `FEATURE_DESKTOP` | 'true' | Desktop mode (cache master password) |
| `FEATURE_CONFIG_CACHE` | 'true' | Server config cache |
| `FEATURE_AUTO_CREATE` | 'true' | Auto-create vault on new server |
| `FEATURE_OFFLINE_ENABLED` | 'true' | Enable offline mode |
| `FEATURE_OFFLINE_SALT` | string | Salt for offline cryptography |
| `FEATURE_CRYPTO_TYPE` | 'online'/'offline' | Crypto backend type |

---

## External dependencies
| Package | Version | Role |
|---|---|---|
| `improved-vaultage-client` | 3.1.1 | Custom Vaultage client (vault CRUD, protocol) |
| `vaultage-protocol` | 5.6.6 | Communication protocol with server |
| `@angular/material` | ^9.1.3 | UI (button, dialog, snackbar, input, list, icon...) |
| `shallow-render` | 9.0.0 | SSR/testing helper |
| `improved-vaultage-client` | 3.1.1 | IOfflineProvider, Vault, ICryptoParams |

---

## Points of attention
1. **Angular import typos:** `snack-bar` (snackbar), `platform-browser-dynamic` (deprecated)
2. **Old stack:** Angular 9 / TypeScript 3.7.5 — upgrade needed for future compatibility
3. **Scattered feature flags:** Duplicated string literals across multiple files — centralize in FeatureDetector
4. **Crypto factory reads localStorage:** No SSR safety, may break in server-side environments
5. **Master password in memory:** Secure but loses access on page reload (desktop mode)
6. **PWA:** Service worker registered in `ngsw-worker.js`, active only in production (`environment.production`)

---

## Commands
```bash
npm start          # ng serve → dev server (:4200)
npm run build-prod # ng build --prod
npm run test       # ng test (Karma, ChromeHeadless)
npm run test-agent # ng test --watch=false (CI/single-run mode)
npm run lint       # tslint
```

## Conventions
- **Always write AGENTS.md in English**, regardless of the user's language preference.
- **Always run `npm run test-agent` (FULL suite) after modifying any test file** — never run partial test execution. The full suite must always be run to verify no regressions.
- **NEVER use `any` type** — TypeScript is typed for good reasons, otherwise we'd be writing plain JavaScript. Use `unknown`, type inference, or explicit type annotations instead.

---

## One-sentence summary
Angular 9 PWA that connects to a self-hosted Vaultage server, with optional local PIN, client-side cryptography (online or offline), and PWA capabilities for accessing passwords even without a connection.

## Additional data
Read file TASK.md, it's the current task you have to achieve.
Read file FINDINGS.md, it's everything you've learned about the current task.

When learning a new trick or tip (for instance, how to use a library you didn't know how to use before), write it down on FINDINGS.md
