import { when } from 'omnimock';
import { fakeAsync, tick } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';

import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { AutoLogoutService } from './auto-logout.service';
import { AutoRedirectService } from './auto-redirect.service';
import { cleanup, mock, omnimockToNgMock, verifyAllMocks } from './test/test-utils';

describe('AppComponent', () => {

    beforeEach(() => {
        const autoLogoutService = mock('AutoLogoutService', AutoLogoutService);
        const autoRedirectService = mock('AutoRedirectService', AutoRedirectService);

        return MockBuilder(AppComponent, AppModule)
            .provide(omnimockToNgMock(autoLogoutService, AutoLogoutService))
            .provide(omnimockToNgMock(autoRedirectService, AutoRedirectService));
    });

    afterEach(cleanup);

    it('should initialize automation services', fakeAsync(async () => {
        const autoLogoutService = mock('AutoLogoutService', AutoLogoutService);
        const autoRedirectService = mock('AutoRedirectService', AutoRedirectService);

        when(autoLogoutService.init()).return().once();
        when(autoRedirectService.init()).return().once();

        const fixture = MockRender(AppComponent);
        tick();
        fixture.detectChanges();
        tick();
        verifyAllMocks();
    }));
});
