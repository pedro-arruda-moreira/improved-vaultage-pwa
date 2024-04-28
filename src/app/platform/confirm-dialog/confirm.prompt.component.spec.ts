import { getShallow } from 'ng-vacuum';
import { Rendering } from 'shallow-render/dist/lib/models/rendering';
import { ConfirmPromptComponent } from './confirm.prompt.component';
import { ComponentFixture, fakeAsync, flush } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';

describe('ConfirmPromptComponent', () => {

    let page: Page;
    let fixture: ComponentFixture<ConfirmPromptComponent>;
    let component: ConfirmPromptComponent;

    beforeEach(async () => {
        const renderer = await getShallow(ConfirmPromptComponent, AppModule).render({
        });
        component = renderer.instance;
        fixture = renderer.fixture;
        page = new Page(renderer);
    });
    it('sends data when clicking yes button', fakeAsync(async () => {
        const promise = component.result;
        clickAndWait(page.yesBtn);
        return promise.then((pass) => {
            expect(pass).toEqual(true);
        });
    }));
    it('sends data when clicking no button', fakeAsync(async () => {
        const promise = component.result;
        clickAndWait(page.noBtn);
        return promise.then((pass) => {
            expect(pass).toEqual(false);
        });
    }));
    function clickAndWait(btn: HTMLElement) {
        btn.click();
        fixture.detectChanges();
        flush();
    }
});

class Page {

    constructor(private readonly renderer: Rendering<ConfirmPromptComponent, any>) { }
    public get yesBtn(): HTMLElement {
        return this.renderer.find(`[test-id=btn-yes]`).nativeElement;
    }
    public get noBtn(): HTMLElement {
        return this.renderer.find(`[test-id=btn-no]`).nativeElement;
    }
}