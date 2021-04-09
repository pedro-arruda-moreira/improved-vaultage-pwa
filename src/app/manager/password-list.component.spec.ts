import { Clipboard } from '@angular/cdk/clipboard';
import { fakeAsync } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { getMock, getShallow } from 'ng-vacuum';
import { instanceOf, mockInstance, when } from 'omnimock';
import { Rendering } from 'shallow-render/dist/lib/models/rendering';

import { AppModule } from '../app.module';
import { ErrorHandlingService } from '../platform/error-handling.service';
import { WINDOW, LOCAL_STORAGE } from '../platform/providers';
import { IPasswordListEntry, PasswordListComponent } from './password-list.component';

/**
 * pedro-arruda-moreira: desktop mode
 */
describe('PasswordListComponent', () => {

    let component: Rendering<PasswordListComponent, { items: IPasswordListEntry[] }>;
    let page: Page;

    function mockItems(): IPasswordListEntry[] {
        return [{
            host: 'github.com',
            id: '1',
            password: 'p@$$ w0rld',
            title: 'GitHub',
            user: 'hmil'
        }, {
            host: 'facebook.com',
            id: '2',
            user: 'Zuck',
            password: 'M@rk',
            title: 'FB'
        }];
    }

    async function buildPage (desktopMode: string) {
        when(getMock(LOCAL_STORAGE).getItem('desktop')).return(desktopMode);
        component = await getShallow(PasswordListComponent, AppModule)
            .render({
                bind: {
                    items: mockItems()
                }
            });
        page = new Page(component);
    }

    it('shows the list of passwords - mobile', async () => {
        await buildPage('false');
        const entries = page.getEntries(false);
        expect(entries.length).toBe(2);
        expect(entries[0].text).toMatch(/GitHub\s+hmil@github.com\s+/);
        expect(entries[1].text).toMatch(/FB\s+Zuck@facebook.com\s+/);
    });

    it('shows the list of passwords - desktop', async () => {
        await buildPage('false');
        const entries = page.getEntries(false);
        expect(entries.length).toBe(2);
        expect(entries[0].text).toContain("GitHub");
        expect(entries[1].text).toContain("FB");
    });

    it('navigates on click', async() => {
        await buildPage('false');
        when(getMock(Router).navigate(['view/', '1'], { relativeTo: instanceOf(ActivatedRoute)})).resolve(true).once();
        page.getEntries(false)[0].element.click();
        expect().nothing();
    });

    it('handles navigation errors', async () => {
        await buildPage('false');
        when(getMock(Router).navigate(['view/', '1'], { relativeTo: instanceOf(ActivatedRoute)})).reject('whoops').once();
        when(getMock(ErrorHandlingService).onError('whoops')).return().once();
        page.getEntries(false)[0].element.click();
        expect().nothing();
    });

    it('copies the password on click - mobile', async () => {
        await buildPage('false');
        when(getMock(Clipboard).copy('p@$$ w0rld')).return(true).once();
        when(getMock(MatSnackBar).open('Password copied to clipboard!')).return(mockInstance('ref')).once();
        when(getMock(WINDOW).history.back()).return().once();
        page.getEntries(false)[0].copy.click();
        expect().nothing();
    });

    it('copies the password on click - desktop', async () => {
        await buildPage('true');
        when(getMock(Clipboard).copy('p@$$ w0rld')).return(true).once();
        when(getMock(MatSnackBar).open('Password copied to clipboard!')).return(mockInstance('ref')).once();
        when(getMock(WINDOW).history.back()).return().once();
        page.getEntries(true)[0].copy.click();
        expect().nothing();
    });
});

class Page {

    constructor(private readonly rendering: Rendering<PasswordListComponent, { items: IPasswordListEntry[] }>) { }

    public getEntries(desktop: boolean) {
        const testId = (desktop ? 'copy-action-desktop' : 'copy-action');
        return this.rendering.find('.item-container').map(t => ({
            element: (t.nativeElement as HTMLDivElement),
            text: (t.nativeElement as HTMLDivElement).innerText,
            copy: (t.nativeElement.querySelector(`[test-id="${testId}"]`) as HTMLDivElement)
        }));
    }
}
