import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { first } from 'rxjs/operators';
import { MockBuilder, MockedComponentFixture, MockRender, MockRenderComponentBindings } from 'ng-mocks';

import { PlatformModule } from '../platform.module';
import { PinCodeComponent } from './pin-code.component';
import { cleanup } from 'src/app/test/test-utils';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PinCodeComponent', () => {

    let page: Page;
    let fixture: MockedComponentFixture<PinCodeComponent, MockRenderComponentBindings<PinCodeComponent>>;
    let confirmation: Promise<string>;
    let altAction: Promise<void>;

    beforeEach(async () => {
        return MockBuilder(PinCodeComponent, PlatformModule)
            .replace(BrowserAnimationsModule, NoopAnimationsModule);
    });

    afterEach(cleanup);

    async function doRender() {
        fixture = MockRender(PinCodeComponent);
        fixture.autoDetectChanges(true);
        fixture.componentInstance.altActionName = 'test';
        fixture.componentInstance.minDigits = 4;
        fixture.detectChanges();
        await fixture.whenStable();
        confirmation = fixture.componentInstance.confirm.pipe(first()).toPromise();
        altAction = fixture.componentInstance.altAction.pipe(first()).toPromise();
        page = new Page(fixture);
    }


    it('can type a combination', fakeAsync(async () => {
        await doRender();
        fixture.detectChanges();
        await fixture.whenStable();
        tick();
        expect(page.acceptButtonDisabled).toBe(true);

        await clickAndWait(page.getKeyNum(1), fixture);
        expect(page.digitsOnScreen).toBe('1');
        tick();
        expect(page.acceptButtonDisabled).toBe(true);

        await clickAndWait(page.getKeyNum(2), fixture);
        expect(page.digitsOnScreen).toBe('•2');
        tick();
        expect(page.acceptButtonDisabled).toBe(true);

        await clickAndWait(page.getKeyNum(3), fixture);
        expect(page.digitsOnScreen).toBe('••3');
        tick();
        expect(page.acceptButtonDisabled).toBe(true);

        await clickAndWait(page.backspaceButton, fixture);
        expect(page.digitsOnScreen).toBe('••');
        tick();
        expect(page.acceptButtonDisabled).toBe(true);

        await clickAndWait(page.getKeyNum(4), fixture);
        expect(page.digitsOnScreen).toBe('••4');
        tick();
        expect(page.acceptButtonDisabled).toBe(true);

        await clickAndWait(page.getKeyNum(5), fixture);
        expect(page.digitsOnScreen).toBe('•••5');
        tick();
        expect(page.acceptButtonDisabled).toBe(false);

        await clickAndWait(page.getKeyNum(6), fixture);
        expect(page.digitsOnScreen).toBe('••••6');
        tick();
        expect(page.acceptButtonDisabled).toBe(false);

        await clickAndWait(page.acceptButton, fixture);

        expect(await confirmation).toBe('12456');
    }));

    it('shows an alternative action when needed', fakeAsync(async () => {
        await doRender();
        fixture.componentInstance.altActionName = undefined;
        fixture.detectChanges();
        tick();
        await fixture.whenStable();
        expect(page.isAlternativeActionShown).toBe(false);
        fixture.componentInstance.altActionName = 'test';
        fixture.detectChanges();
        tick();
        await fixture.whenStable();
        expect(page.isAlternativeActionShown).toBe(true);

        await clickAndWait(page.alternativeAction, fixture);
        expect(await altAction).toBeUndefined();
    }));

    async function clickAndWait(btn: HTMLElement, fixture: MockedComponentFixture<PinCodeComponent, MockRenderComponentBindings<PinCodeComponent>>) {
        btn.dispatchEvent(new CustomEvent("pointerdown"));
        btn.click();
        fixture.detectChanges();
        await fixture.whenStable();
        tick();
    }
});

class Page {

    constructor(private readonly fixture: MockedComponentFixture<PinCodeComponent, MockRenderComponentBindings<PinCodeComponent>>) { }

    public getKeyNum(num: number): HTMLButtonElement {
        return this.fixture.nativeElement.querySelector(`[test-id=keypad-${num}`);
    }

    public get acceptButton(): HTMLButtonElement {
        return this.fixture.nativeElement.querySelector('[test-id=keypad-accept]');
    }

    public get acceptButtonDisabled() {
        return (this.acceptButton.getAttribute('ng-reflect-disabled') ?? 'false') == 'true';
    }

    public get backspaceButton(): HTMLButtonElement {
        return this.fixture.nativeElement.querySelector('[test-id=keypad-backspace]');
    }

    public get digitsOnScreen() {
        return this.fixture.nativeElement.querySelector('[test-id=keypad-screen]').innerText.replace(/\s/g, '');
    }

    public get isAlternativeActionShown() {
        return this.fixture.nativeElement.querySelector('[test-id=keypad-alt]') !== null;
    }

    public get alternativeAction(): HTMLElement {
        return this.fixture.nativeElement.querySelector('[test-id=keypad-alt]');
    }
}
