import { Router } from '@angular/router';
import { anyString, when, equals, anything, instance, anyOf } from 'omnimock';
import { Vault } from 'improved-vaultage-client';
import { Mock } from 'omnimock';

import { AuthService, LoginConfig } from './auth.service';
import { PinLockService } from './pin-lock.service';
import { VAULTAGE, LOCAL_STORAGE } from './platform/providers';
import { Vaultage } from './platform/providers';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PasswordPromptComponent } from './platform/password-prompt/password.prompt.component';
import { LocalStorageConfigCache } from './util/LocalStorageConfigCache';
import { OfflineService } from './offline.service';
import { FEATURE_CONFIG_CACHE, FEATURE_DESKTOP, FEATURE_AUTO_CREATE } from 'src/misc/FeatureDetector';
import { DEFAULT_SJCL_PARAMS } from './crypto/internal/CryptoImpl';
import { cleanup, mock, verifyAllMocks } from './test/test-utils';

describe('AuthService', () => {

    let service: AuthService;
    let dbRevision = 4;

    let fakeVaultMock: Mock<Vault>;
    let fakeVault: Vault;
    let offlineServiceMock: Mock<OfflineService>;
    let offlineService: OfflineService;
    let mockPinLockService: Mock<PinLockService>;
    let mockRouter: Mock<Router>;
    let mockVaultage: Mock<Vaultage>;
    let mockMatDialog: Mock<MatDialog>;
    let mockLocalStorage: Mock<Storage>;
    let mockConfigCache: Mock<LocalStorageConfigCache>;

    let runningOffline = false;
    let offlineEnabled = false;
    function fakeLoginConfig(): LoginConfig {
        return {
            username: 'John',
            password: 'Tr4v0lt4',
            url: 'http://pulp.fiction',
            basic: {
                username: 'Quentin',
                password: 'Tarantino'
            }
        };
    }

    let changeEvents: boolean[];

    beforeEach(() => {
        runningOffline = false;
        offlineEnabled = false;
        dbRevision = 4;
        changeEvents = [];
        fakeVaultMock = mock('Vault', Vault);
        fakeVault = instance(fakeVaultMock);
        offlineServiceMock = mock('OfflineService', OfflineService);
        offlineService = instance(offlineServiceMock);
        mockPinLockService = mock('PinLockService', PinLockService);
        mockRouter = mock('Router', Router);
        mockVaultage = mock(VAULTAGE, Vaultage);
        mockMatDialog = mock('MatDialog', MatDialog);
        mockLocalStorage = mock(LOCAL_STORAGE, Storage);
        mockConfigCache = mock('LocalStorageConfigCache', LocalStorageConfigCache);

        service = new AuthService(
            instance(mockPinLockService),
            instance(mockRouter),
            instance(mockVaultage),
            instance(mockMatDialog),
            instance(mockLocalStorage),
            instance(mockConfigCache)
        );
        service.offlineService = offlineService;
        service.authStatusChange$.subscribe(change => changeEvents.push(change));
        when(fakeVaultMock.getDBRevision()).call(() => dbRevision);
        when(offlineServiceMock.isRunningOffline()).call(() => Promise.resolve(runningOffline));
        when(offlineServiceMock.offlineEnabled).call(() => offlineEnabled);
    });

    afterEach(cleanup);

    it('testCredentials logs in to test the credentials', async () => {
        offlineEnabled = true;
        const config = fakeLoginConfig();

        when(mockLocalStorage.getItem(FEATURE_CONFIG_CACHE)).return('true').once();
        when(mockVaultage.doLogin({
            serverURL: 'http://pulp.fiction',
            username: 'John',
            masterPassword: 'Tr4v0lt4',
            httpParams: { auth: { username: 'Quentin', password: 'Tarantino' } },
            configCache: instance(mockConfigCache),
            offlineProvider: offlineService,
            cryptoParams: DEFAULT_SJCL_PARAMS
        }))
            .return(Promise.resolve(fakeVault))
            .once();
        await service.testCredentials(config);
        expect().nothing();
        verifyAllMocks();
    });

    it('getVault throws an error when not authenticated', () => {
        expect(() => service.getVault()).toThrowError(/not authenticated/i);
        verifyAllMocks();
    });

    it('starts out not authenticated', () => {
        expect(service.isAuthenticated).toBe(false);
        verifyAllMocks();
    });

    it('authStatusChange$ emits a value immediately', () => {
        expect(changeEvents.length).toBe(1);
        expect(changeEvents[0]).toBe(false);
        verifyAllMocks();
    });

    async function doTestDesktop() {

        const config = fakeLoginConfig();

        when(mockMatDialog.closeAll()).return().once();
        const mockPasswordPrompt = {
            password: Promise.resolve('Tr4v0lt4')
        } as PasswordPromptComponent;
        when(mockMatDialog.open(anything(), anything())).return(
            {
                componentInstance: (mockPasswordPrompt as unknown) as PasswordPromptComponent
            } as MatDialogRef<PasswordPromptComponent, any>).once();
        when(mockLocalStorage.getItem(FEATURE_CONFIG_CACHE)).return('false').times(2);
        when(mockLocalStorage.getItem(equals(FEATURE_DESKTOP))).return('true');
        when(mockVaultage.doLogin({
            serverURL: 'http://pulp.fiction',
            username: 'John',
            masterPassword: 'Tr4v0lt4',
            httpParams: { auth: { username: 'Quentin', password: 'Tarantino' } },
            offlineProvider: (offlineEnabled ? offlineService : undefined),
            cryptoParams: DEFAULT_SJCL_PARAMS,
            configCache: undefined
        }))
            .return(Promise.resolve(fakeVault));
        if (!runningOffline) {
            when(mockPinLockService.setSecret('1234', anyString()))
                .call((_, secret) => {
                    expect(JSON.parse(secret)).toEqual(config);
                    return Promise.resolve();
                })
                .times(2);
        }
        when(mockRouter.navigateByUrl(anyString(), { replaceUrl: true })).return(Promise.resolve(true)).times(2);
        dbRevision = 0;
        when(mockLocalStorage.getItem(FEATURE_AUTO_CREATE)).return('true').once();
        when(fakeVaultMock.save()).return(Promise.resolve()).once();
        await service.logIn(config, '1234');
        dbRevision = 1;
        expect(service.isAuthenticated).toBe(true);
        expect(service.getVault()).toBe(fakeVault);
        expect(changeEvents.length).toBe(2);
        expect(changeEvents[1]).toBe(true);

        service.logOut();

        expect(service.isAuthenticated).toBe(false);
        expect(() => service.getVault()).toThrowError(/not authenticated/i);
        expect(changeEvents.length).toBe(3);
        expect(changeEvents[2]).toBe(false);
        await service.logIn(config, '1234');
    }
    it('logIn only asks for master password once per session - desktop (with auto_create on)', async () => {
        await doTestDesktop();
        verifyAllMocks();
    });
    it('logIn only asks for master password once per session - desktop (with auto_create on and running offline)', async () => {
        runningOffline = true;
        offlineEnabled = true;
        await doTestDesktop();
        verifyAllMocks();
    });

    it('logIn logs in and redirects, logOut logs out', async () => {
        const config = fakeLoginConfig();

        when(mockMatDialog.closeAll()).return().once();
        when(mockLocalStorage.getItem(FEATURE_CONFIG_CACHE)).return('true').once();
        when(mockLocalStorage.getItem(equals(FEATURE_DESKTOP))).return('false').times(2);
        when(mockVaultage.doLogin({
            serverURL: 'http://pulp.fiction',
            username: 'John',
            masterPassword: 'Tr4v0lt4',
            httpParams: { auth: { username: 'Quentin', password: 'Tarantino' } },
            configCache: instance(mockConfigCache),
            cryptoParams: DEFAULT_SJCL_PARAMS,
            offlineProvider: undefined
        }))
            .return(Promise.resolve(fakeVault));
        when(mockPinLockService.setSecret('1234', anyString()))
            .call((pin, secret) => {
                expect(JSON.parse(secret)).toEqual(config);
                return Promise.resolve();
            })
            .once();
        when(mockRouter.navigateByUrl(anyString(), { replaceUrl: true })).return(Promise.resolve(true)).once();
        await service.logIn(config, '1234');

        expect(service.isAuthenticated).toBe(true);
        expect(service.getVault()).toBe(fakeVault);
        expect(changeEvents.length).toBe(2);
        expect(changeEvents[1]).toBe(true);

        service.logOut();

        expect(service.isAuthenticated).toBe(false);
        expect(() => service.getVault()).toThrowError(/not authenticated/i);
        expect(changeEvents.length).toBe(3);
        expect(changeEvents[2]).toBe(false);
        verifyAllMocks();
    });

    it('logIn redirects to next URL', async () => {
        const config = fakeLoginConfig();

        when(mockLocalStorage.getItem(equals(FEATURE_DESKTOP))).return('false');
        when(mockLocalStorage.getItem(FEATURE_CONFIG_CACHE)).return('true').once();
        when(mockVaultage.doLogin({
            serverURL: 'http://pulp.fiction',
            username: 'John',
            masterPassword: 'Tr4v0lt4',
            httpParams: { auth: { username: 'Quentin', password: 'Tarantino' } },
            configCache: instance(mockConfigCache),
            cryptoParams: DEFAULT_SJCL_PARAMS,
            offlineProvider: undefined
        }))
            .return(Promise.resolve(fakeVault));
        when(mockPinLockService.setSecret('1234', anyString())).return(Promise.resolve()).once();
        when(mockRouter.navigateByUrl(anyString(), { replaceUrl: true })).call(url => {
            expect(url).toBe('/next');
            return Promise.resolve(true);
        }).once();
        await service.logIn(config, '1234', '/next');
        verifyAllMocks();
    });
    it('changeMasterPassword throw exceptions on validation errors - master pass confirmation wrong', async () => {
        const mockPasswordPromptComponentMock = mock('PasswordPromptComponent', PasswordPromptComponent);
        const mockPasswordPromptComponent = instance(mockPasswordPromptComponentMock) as PasswordPromptComponent;

        when(mockPasswordPromptComponentMock.password).return(Promise.resolve('mypass123')).once();
        when(mockMatDialog.open(anyOf(PasswordPromptComponent), anything())).return(
            {
                componentInstance: mockPasswordPromptComponent
            } as MatDialogRef<PasswordPromptComponent, any>).once();
        try {
            await service.changeMasterPassword();
            fail('exception expected');
        } catch (e) {
            expect((e as Error).message).toBe('Password does not match. Try again.');
        }
        verifyAllMocks();
    });
    it('changeMasterPassword throw exceptions on validation errors - new pass confirmation wrong', async () => {
        const mockPasswordPromptComponentMock = mock('PasswordPromptComponent', PasswordPromptComponent);
        const mockPasswordPromptComponent = instance(mockPasswordPromptComponentMock) as PasswordPromptComponent;

        let count = 0;
        when(mockPasswordPromptComponentMock.password).call(() => {
            switch (++count) {
                case 1:
                    return Promise.resolve('');
                case 2:
                    return Promise.resolve('new_pass');
                default:
                    return Promise.resolve('wrong_new_pass');
            }
        }).times(3);
        when(mockMatDialog.open(anyOf(PasswordPromptComponent), anything())).return(
            {
                componentInstance: mockPasswordPromptComponent
            } as MatDialogRef<PasswordPromptComponent, any>).times(3);
        try {
            await service.changeMasterPassword();
            fail('exception expected');
        } catch (e) {
            expect((e as Error).message).toBe('Confirmation does not match. Try Again.');
        }
        verifyAllMocks();
    });
    it('changeMasterPassword changes master password', async () => {
        const config = fakeLoginConfig();

        when(mockLocalStorage.getItem(FEATURE_CONFIG_CACHE)).return('true').once();
        when(mockLocalStorage.getItem(equals(FEATURE_DESKTOP))).return('false');
        when(mockVaultage.doLogin({
            serverURL: 'http://pulp.fiction',
            username: 'John',
            masterPassword: 'Tr4v0lt4',
            httpParams: { auth: { username: 'Quentin', password: 'Tarantino' } },
            configCache: instance(mockConfigCache),
            cryptoParams: DEFAULT_SJCL_PARAMS,
            offlineProvider: undefined
        }))
            .return(Promise.resolve(fakeVault));
        when(mockPinLockService.setSecret('1234', anyString())).return(Promise.resolve()).once();
        when(mockRouter.navigateByUrl(anyString(), { replaceUrl: true })).call(url => {
            expect(url).toBe('/next');
            return Promise.resolve(true);
        }).once();
        await service.logIn(config, '1234', '/next');

        let count = 0;
        const mockPasswordPromptComponentMock = mock('PasswordPromptComponent', PasswordPromptComponent);
        const mockPasswordPromptComponent = instance(mockPasswordPromptComponentMock) as PasswordPromptComponent;
        when(fakeVaultMock.updateMasterPassword('new_pass')).return(Promise.resolve()).once();
        when(mockPasswordPromptComponentMock.password).call(() => {
            switch (++count) {
                case 1:
                    return Promise.resolve('Tr4v0lt4');
                case 2:
                    return Promise.resolve('new_pass');
                default:
                    return Promise.resolve('new_pass');
            }
        }).times(3);
        when(mockMatDialog.open(anyOf(PasswordPromptComponent), anything())).return(
            {
                componentInstance: mockPasswordPromptComponent
            } as MatDialogRef<PasswordPromptComponent, any>).times(3);
        await service.changeMasterPassword();
        verifyAllMocks();
    });
});
