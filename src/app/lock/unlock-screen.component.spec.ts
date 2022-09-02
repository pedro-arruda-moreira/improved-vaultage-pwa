import { fakeAsync, flush } from '@angular/core/testing';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { getMock, renderComponent } from 'ng-vacuum';
import { anyFunction, anyString, anything, instance, Mock, when } from 'omnimock';
import { Rendering } from 'shallow-render/dist/lib/models/rendering';

import { AppModule } from '../app.module';
import { AuthService } from '../auth.service';
import { PinLockService } from '../pin-lock.service';
import { BusyStateService } from '../platform/busy-state.service';
import { ErrorHandlingService } from '../platform/error-handling.service';
import { PinCodeComponent } from '../platform/pin-code/pin-code.component';
import { RedirectService } from '../redirect.service';
import { UnlockScreenComponent } from './unlock-screen.component';
import { WINDOW } from '../platform/providers';
import { MatDialog } from '@angular/material/dialog';

describe('UnlockScreenComponent', () => {

    let page: Page;
    let isOffline = false;
    let navigatorMock: Mock<Navigator>;
    let offlineToggleCallback: EventListener;
    let expectedTimesForNavigador: number;
    let receivedTimesForNavigador: number;
    let expectedTimesForNavigadorOnline: number;
    let receivedTimesForNavigadorOnline: number;

    async function doRender() {
        const rendering = await renderComponent(UnlockScreenComponent, AppModule);
        page = new Page(rendering);
    }

    beforeEach(fakeAsync(async () => {
        expectedTimesForNavigador = 1;
        receivedTimesForNavigador = 0;
        expectedTimesForNavigadorOnline = 1;
        receivedTimesForNavigadorOnline = 0;
        offlineToggleCallback = () => {};
        navigatorMock = getMock(Navigator);
        isOffline = false;
        when(navigatorMock.onLine).call(() => {
            receivedTimesForNavigadorOnline++;
            return !isOffline
        }).anyTimes();
        when(getMock(WINDOW).navigator).call(() => {
            receivedTimesForNavigador++;
            return instance(navigatorMock)
        }).anyTimes();
        when(getMock(WINDOW).addEventListener(anyString(), anyFunction())).call((_, f) => {
            offlineToggleCallback = f as EventListener;
        }).times(2);
    }));

    afterEach(() => {
        expect(receivedTimesForNavigador).toBe(expectedTimesForNavigador);
        expect(receivedTimesForNavigadorOnline).toBe(expectedTimesForNavigadorOnline);
    });

    it('alternative action is log out and redirect', fakeAsync(async () => {
        await doRender();
        when(getMock(PinLockService).reset()).return().once();
        /*
         * pedro-arruda-moreira: desktop mode.
         */
        when(getMock(AuthService).reset()).return().once();
        when(getMock(RedirectService).redirectToAuthZone('foo/bar')).return().once();
        when(getMock(ActivatedRoute).snapshot.url).useValue([new UrlSegment('foo', {}), new UrlSegment('bar', {})]).once();
        page.pinCode.altAction.next();
        expect().nothing();
    }));

    it('logs in on submit', fakeAsync(async () => {
        await doRender();
        when(getMock(BusyStateService).setBusy(true)).return().once();
        when(getMock(PinLockService).hasSecret).useValue(true).once();
        /*
         * pedro-arruda-moreira: desktop mode.
         */
        when(getMock(PinLockService).getSecret('1234')).return(Promise.resolve('"secret"')).once();
        when(getMock(ActivatedRoute).snapshot.queryParamMap.get('next')).return('next_url').once();
        when(getMock(AuthService).logIn('secret' as any, '1234', 'next_url')).resolve().once();
        when(getMock(BusyStateService).setBusy(false)).return().once();
        page.pinCode.confirm.next('1234');
        flush();
        expect().nothing();
    }));

    it('logs in on submit - offline mode', fakeAsync(async () => {
        expectedTimesForNavigador = 2;
        expectedTimesForNavigadorOnline = 2;
        isOffline = true;
        when(getMock(MatDialog).closeAll()).return().once();
        when(getMock(AuthService).getPasswordFromDialog('Offline mode. Please enter Master Password:')).return(
            Promise.resolve('1234')
        ).once();
        when(getMock(BusyStateService).setBusy(true)).return().once();
        when(getMock(PinLockService).hasSecret).useValue(true).once();
        /*
         * pedro-arruda-moreira: desktop mode.
         */
        when(getMock(PinLockService).getSecret('1234')).return(Promise.resolve('"secret"')).once();
        when(getMock(ActivatedRoute).snapshot.queryParamMap.get('next')).return('next_url').once();
        when(getMock(AuthService).logIn('secret' as any, '1234', 'next_url')).resolve().once();
        when(getMock(BusyStateService).setBusy(false)).return().once();
        await doRender();
        flush();
        isOffline = false;
        flush();
        offlineToggleCallback(
            null as unknown as Event
        );
        flush();
        expect().nothing();
    }));

    it('logs in on submit (no next url)', fakeAsync(async () => {
        await doRender();
        when(getMock(BusyStateService).setBusy(true)).return().once();
        when(getMock(PinLockService).hasSecret).useValue(true).once();
        /*
         * pedro-arruda-moreira: desktop mode.
         */
        when(getMock(PinLockService).getSecret('1234')).return(Promise.resolve('"secret"')).once();
        when(getMock(ActivatedRoute).snapshot.queryParamMap.get('next')).return(null).once();
        when(getMock(AuthService).logIn('secret' as any, '1234', undefined)).resolve().once();
        when(getMock(BusyStateService).setBusy(false)).return().once();
        page.pinCode.confirm.next('1234');
        flush();
        expect().nothing();
    }));

    it('fails on invalid pin', fakeAsync(async () => {
        await doRender();
        when(getMock(BusyStateService).setBusy(true)).return().once();
        when(getMock(PinLockService).hasSecret).useValue(true).once();
        /*
         * pedro-arruda-moreira: desktop mode.
         */
        when(getMock(PinLockService).getSecret('1234')).return(Promise.resolve(undefined)).once();
        when(getMock(BusyStateService).setBusy(false)).return().once();
        when(getMock(ErrorHandlingService).onError(anything())).call(err => {
            expect(err).toMatch(/Invalid pin/);
        }).once();
        page.pinCode.confirm.next('1234');
        flush();
        expect().nothing();
    }));

    it('redirects when no pin set', fakeAsync(async () => {
        await doRender();
        when(getMock(ErrorHandlingService).onError(anything())).return().never(); // Expect no error
        when(getMock(BusyStateService).setBusy(true)).return().once();
        when(getMock(PinLockService).hasSecret).useValue(false).once();
        when(getMock(ActivatedRoute).snapshot.url).useValue([new UrlSegment('foo', {}), new UrlSegment('bar', {})]).once();
        when(getMock(RedirectService).redirectToAuthZone('foo/bar')).return().once();
        when(getMock(BusyStateService).setBusy(false)).return().once();
        page.pinCode.confirm.next('1234');
        flush();
        expect().nothing();
    }));
});

class Page {
    constructor(private readonly rendering: Rendering<UnlockScreenComponent, Partial<UnlockScreenComponent>>) { }

    public get pinCode(): PinCodeComponent {
        return this.rendering.find('app-pin-code').componentInstance;
    }
}
