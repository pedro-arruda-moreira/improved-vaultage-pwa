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
    beforeEach(async () => {
        component = await getShallow(PasswordListComponent, AppModule)
            .render({
                bind: {
                    items: mockItems()
                }
            });
        page = new Page(component);
    });

    it('shows the list of passwords', async () => {
        const entries = page.getEntries();
        expect(entries.length).toBe(2);
        expect(entries[0].text).toContain('GitHub');
        expect(entries[1].text).toContain('FB');
    });

    it('navigates on click', async() => {
        when(getMock(Router).navigate(['view/', '1'], { relativeTo: instanceOf(ActivatedRoute)})).resolve(true).once();
        page.getEntries()[0].element.click();
        expect().nothing();
    });

    it('handles navigation errors', async () => {
        when(getMock(Router).navigate(['view/', '1'], { relativeTo: instanceOf(ActivatedRoute)})).reject('whoops').once();
        when(getMock(ErrorHandlingService).onError('whoops')).return().once();
        page.getEntries()[0].element.click();
        expect().nothing();
    });

    it('copies the password on click', async () => {
        when(getMock(Clipboard).copy('p@$$ w0rld')).return(true).once();
        when(getMock(MatSnackBar).open('Password copied to clipboard!')).return(mockInstance('ref')).once();
        page.getEntries()[0].copyPassword.click();
        expect().nothing();
    });

    it('copies the username on click', async () => {
        when(getMock(Clipboard).copy('hmil')).return(true).once();
        when(getMock(MatSnackBar).open('Username copied to clipboard!')).return(mockInstance('ref')).once();
        page.getEntries()[0].copyUsername.click();
        expect().nothing();
    });
});

class Page {

    constructor(private readonly rendering: Rendering<PasswordListComponent, { items: IPasswordListEntry[] }>) { }

    public getEntries() {
        return this.rendering.find('.item-container').map(t => ({
            element: (t.nativeElement as HTMLDivElement),
            text: (t.nativeElement as HTMLDivElement).innerText,
            copyPassword: (t.nativeElement.querySelector('[test-id="copy-action-password"]')),
            copyUsername: (t.nativeElement.querySelector('[test-id="copy-action-username"]'))
        }));
    }
}
