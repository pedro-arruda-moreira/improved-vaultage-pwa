import { ComponentFixture } from '@angular/core/testing';
import { getShallow, getMock } from 'ng-vacuum';
import { first } from 'rxjs/operators';
import { Rendering } from 'shallow-render/dist/lib/models/rendering';
import { typeValue } from '../../test/test-utils';

import { AppModule } from '../../app.module';
import { PasswordEntry } from '../domain/PasswordEntry';
import { PasswordFormComponent } from './password-form.component';
// pedro-arruda-moreira: textarea auto sizing.
import { when } from 'omnimock';
import { TextareaResizer } from 'src/app/util/TextareaResizer';

describe('PasswordFormComponent', () => {

    let page: Page;
    let binding: {
        entry: PasswordEntry
    };
    let fixture: ComponentFixture<PasswordFormComponent>;
    let confirm: Promise<PasswordEntry>;

    beforeEach(async () => {
        // pedro-arruda-moreira: textarea auto sizing.
        when(getMock(TextareaResizer).doResizeTextareas()).return().once();
        const rendering = await getShallow(PasswordFormComponent, AppModule)
            .render({
                bind: {
                    entry: {
                        title: '',
                        login: '',
                        password: '',
                        id: '',
                        url: ''
                    }
                }
            });
        page = new Page(rendering);
        binding = rendering.bindings as any;
        fixture = rendering.fixture;
        confirm = rendering.outputs.confirm.pipe(first()).toPromise();
    });

    it('shows the entry data', async () => {
        binding.entry = {
            id: '123',
            login: 'hello',
            password: 'world',
            title: 'The World',
            // pedro-arruda-moreira: changed client/secure notes
            itemUrl: 'http://the-world.com',
            secureNoteText: 'msn3'
        };
        fixture.detectChanges();
        await fixture.whenStable();
        expect(page.titleInput.value).toBe('The World');
        expect(page.usernameInput.value).toBe('hello');
        expect(page.passwordInput.value).toBe('world');
        expect(page.urlInput.value).toBe('http://the-world.com');
    });

    it('sends the data', async () => {
        typeValue(page.titleInput, 'The fox');
        typeValue(page.usernameInput, 'Fox');
        typeValue(page.passwordInput, 'qu1ck');
        typeValue(page.urlInput, 'http://quickbrownfox.com');
        // pedro-arruda-moreira: secure notes
        typeValue(page.secureNoteInput, 'msn4');

        page.saveButton.click();
        expect(await confirm).toEqual({
            id: '',
            login: 'Fox',
            password: 'qu1ck',
            title: 'The fox',
            // pedro-arruda-moreira: changed client/secure notes
            itemUrl: 'http://quickbrownfox.com',
            secureNoteText: 'msn4'
        });
    });

    it('toggles password visibility', async () => {
        expect(page.passwordInputType).toBe('password');
        page.togglePasswordButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(page.passwordInputType).toBe('text');
        page.togglePasswordButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(page.passwordInputType).toBe('password');
    });
});

class Page {

    constructor(private readonly rendering: Rendering<PasswordFormComponent, unknown>) { }

    get titleInput() {
        return (this.rendering.find('[test-id=entry-form-title]').nativeElement as HTMLInputElement);
    }
    get urlInput() {
        return (this.rendering.find('[test-id=entry-form-url]').nativeElement as HTMLInputElement);
    }
    // pedro-arruda-moreira: secure notes
    get secureNoteInput() {
        return (this.rendering.find('[test-id=secure-notes]').nativeElement as HTMLInputElement);
    }
    get usernameInput() {
        return (this.rendering.find('[test-id=entry-form-username]').nativeElement as HTMLInputElement);
    }
    get passwordInput() {
        return (this.rendering.find('[test-id=entry-form-password]').nativeElement as HTMLInputElement);
    }
    get saveButton() {
        return (this.rendering.find('[test-id=entry-form-save]').nativeElement as HTMLButtonElement);
    }
    get togglePasswordButton() {
        return (this.rendering.find('[test-id=entry-form-toggle-password]').nativeElement as HTMLElement);
    }
    get passwordInputType() {
        return this.passwordInput.getAttribute('ng-reflect-type');
    }
}
