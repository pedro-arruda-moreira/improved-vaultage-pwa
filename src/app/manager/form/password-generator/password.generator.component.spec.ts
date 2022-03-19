import { ComponentFixture, flush, fakeAsync } from '@angular/core/testing';
import { getShallow, getMock } from 'ng-vacuum';
import { Rendering } from 'shallow-render/dist/lib/models/rendering';

import { AppModule } from '../../../app.module';
import { PasswordGeneratorComponent } from './password.generator.component';
import { WINDOW } from 'src/app/platform/providers';
import { instance } from 'omnimock';
import { typeValue, createNewEvent } from 'src/app/test/test-utils';

describe('PasswordGeneratorComponent', () => {

    let page: Page;
    let fixture: ComponentFixture<PasswordGeneratorComponent>;
    let component: PasswordGeneratorComponent;

    beforeEach(async () => {
        (instance(getMock(WINDOW)) as any).generatePassword = require(
            '../../../../assets/js/password-generator.min.js');
        const rendering = await getShallow(PasswordGeneratorComponent, AppModule)
            .render();
        page = new Page(rendering);
        fixture = rendering.fixture;
        component = rendering.instance;
        fixture.detectChanges();
    });

    it('generates a new password when starting component', () => {
        expect(component.password.length).toEqual(12);
        expect(page.passwordField.value).toEqual(component.password);
    });
    it('generates a new password when clicking re-generate', fakeAsync(() => {
        const oldPassword = component.password;
        expect(oldPassword.length).toEqual(12);
        expect(page.passwordField.value).toEqual(oldPassword);
        clickAndWait(page.reGenerate);
        expect(component.password).not.toEqual(oldPassword);
        expect(page.passwordField.value).not.toEqual(oldPassword);
    }));
    it('generates a new password when changing type', fakeAsync(async () => {
        const firtPass = changeType();
        const pass1 = changeType(page.passwordTypeAllChars);
        const pass2 = changeType(page.passwordTypeNumbers);
        const pass3 = changeType(page.passwordTypeMemorable);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(firtPass).not.toEqual(pass1);
        expect(pass1).not.toEqual(pass2);
        expect(pass2).not.toEqual(pass3);
        expect(parseInt(pass2)).not.toBeNaN();
        expect(parseInt(pass1)).toBeNaN();
        expect(parseInt(pass3)).toBeNaN();
    }));
    it('generates a new password when changing type - changing length', fakeAsync(async () => {
        typeValue(page.passwordLengthField, '8');
        page.passwordLengthField.dispatchEvent(createNewEvent('keyup'));
        fixture.detectChanges();
        await fixture.whenStable();
        flush();
        const firtPass = changeType(undefined, 8);
        const pass1 = changeType(page.passwordTypeAllChars, 8);
        const pass2 = changeType(page.passwordTypeNumbers, 8);
        const pass3 = changeType(page.passwordTypeMemorable, 8);
        await fixture.whenStable();
        fixture.detectChanges();
        expect(firtPass).not.toEqual(pass1);
        expect(pass1).not.toEqual(pass2);
        expect(pass2).not.toEqual(pass3);
        expect(parseInt(pass2)).not.toBeNaN();
        expect(parseInt(pass1)).toBeNaN();
        expect(parseInt(pass3)).toBeNaN();
    }));
    it('promises the generated password when clicking OK', fakeAsync(async () => {
        const promise = component.generatedPassword;
        clickAndWait(page.okBtn);
        const pass = await promise;
        expect(pass).not.toBeNull();
        expect(pass.length).toEqual(12);
    }));
    it('rejects the generated password when clicking cancel', fakeAsync(async () => {
        const promise = component.generatedPassword;
        try {
            clickAndWait(page.cancelBtn);
            await promise;
            fail('reject expected');
        } catch(e) {
            // success
        }
    }));
    function changeType(btn?: HTMLElement, expectedSize = 12) {
        if(btn) {
            clickAndWait(btn);
        }
        const pass = component.password;
        expect(pass.length).toEqual(expectedSize);
        expect(page.passwordField.value).toEqual(pass);
        return pass;
    }
    function clickAndWait(btn: HTMLElement) {
        btn.click();
        fixture.detectChanges();
        flush();
    }
});

class Page {

    constructor(private readonly rendering: Rendering<PasswordGeneratorComponent, unknown>) { }

    get passwordTypeMemorable() {
        return (this.rendering.find('[test-id=type-memorable]').nativeElement);
    }
    get passwordTypeAllChars() {
        return (this.rendering.find('[test-id=type-all]').nativeElement);
    }
    get passwordTypeNumbers() {
        return (this.rendering.find('[test-id=type-numbers]').nativeElement);
    }
    get passwordField() {
        return (this.rendering.find('[test-id=password]').nativeElement as HTMLInputElement);
    }
    get passwordLengthField() {
        return (this.rendering.find('[test-id=password-length]').nativeElement as HTMLInputElement);
    }
    get reGenerate() {
        return (this.rendering.find('[test-id=re-generate]').nativeElement);
    }
    get okBtn() {
        return (this.rendering.find('[test-id=button-ok]').nativeElement);
    }
    get cancelBtn() {
        return (this.rendering.find('[test-id=button-cancel]').nativeElement);
    }
}
