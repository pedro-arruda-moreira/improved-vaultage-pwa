import { getMock, renderComponent } from 'ng-vacuum';
import { when } from 'omnimock';

import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { AutoLogoutService } from './auto-logout.service';
import { AutoRedirectService } from './auto-redirect.service';
import { fakeAsync } from '@angular/core/testing';

describe('AppComponent', () => {

    it('should initialize automation services', fakeAsync(async () => {
        when(getMock(AutoLogoutService).init()).return().once();
        when(getMock(AutoRedirectService).init()).return().once();

        const { element } = await renderComponent(AppComponent, AppModule);
        const app = element.componentInstance as AppComponent;
        expect(app).toBeTruthy();
    }));
});
