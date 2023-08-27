import { getShallow, getMock } from 'ng-vacuum';
import { Rendering } from 'shallow-render/dist/lib/models/rendering';
import { PasswordPromptComponent } from './password.prompt.component';
import { ComponentFixture, fakeAsync, flush } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';
import { typeValue, createNewEvent } from 'src/app/test/test-utils';
import { when } from 'omnimock';
import { MatDialog } from '@angular/material/dialog';

describe('PasswordPromptComponent', () => {

    let page: Page;
    let fixture: ComponentFixture<PasswordPromptComponent>;
    let component: PasswordPromptComponent;

    beforeEach(async () => {
        const renderer = await getShallow(PasswordPromptComponent, AppModule).render({
        });
        component = renderer.instance;
        fixture = renderer.fixture;
        page = new Page(renderer);
    });
    it('toggles visibility', fakeAsync(() => {
        expect(page.passwordInputType).toEqual('password');
        clickAndWait(page.toggleVisibility);
        expect(page.passwordInputType).toEqual('text');
        clickAndWait(page.toggleVisibility);
        expect(page.passwordInputType).toEqual('password');
    }));
    it('sends data when clicking ok button', fakeAsync(async () => {
        const promise = component.password;
        typeValue(page.passwordInput, 'myPassword');
        clickAndWait(page.okBtn);
        return promise.then((pass) => {
            expect(pass).toEqual('myPassword');
        });
    }));
    it('sends data when pressing enter', fakeAsync(async () => {
        const promise = component.password;
        when(getMock(MatDialog).closeAll()).return().once();
        typeValue(page.passwordInput, 'myPassword');
        sendEnter(page.passwordInput);
        return promise.then((pass) => {
            expect(pass).toEqual('myPassword');
        });
    }));
    it('does not send data when clicking cancel button', fakeAsync(async () => {
        const promise = component.password;
        expect(promise).toBeDefined();
        try {
            clickAndWait(page.cancelBtn);
            fail('exception expected.');
        } catch(e) {
            expect(e.rejection.message).toEqual('Password prompt cancelled by user.');
        }
    }));
    function clickAndWait(btn: HTMLElement) {
        btn.click();
        fixture.detectChanges();
        flush();
    }
    function sendEnter(btn: HTMLElement) {
        btn.dispatchEvent(createNewEvent('keyup', undefined, undefined, {
            keyCode: 13
        }));
    }
});

class Page {

    constructor(private readonly renderer: Rendering<PasswordPromptComponent, any>) { }

    public get passwordInput(): HTMLInputElement {
        return this.renderer.find(`[test-id=password-input]`).nativeElement;
    }
    public get toggleVisibility(): HTMLElement {
        return this.renderer.find(`[test-id=toggle-password]`).nativeElement;
    }
    public get okBtn(): HTMLElement {
        return this.renderer.find(`[test-id=btn-ok]`).nativeElement;
    }
    public get cancelBtn(): HTMLElement {
        return this.renderer.find(`[test-id=btn-cancel]`).nativeElement;
    }
    get passwordInputType() {
        return this.passwordInput.getAttribute('ng-reflect-type');
    }
}