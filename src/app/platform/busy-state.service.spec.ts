import { BusyStateService } from './busy-state.service';
import { cleanup } from '../test/test-utils';

describe('BusyStateService', () => {

    let service: BusyStateService;

    beforeEach(() => {
        service = new BusyStateService();
    });

    afterEach(cleanup);

    it('stores a simple boolean value', () => {
        expect(service.isBusy).toBe(false);
        service.setBusy(true);
        expect(service.isBusy).toBe(true);
        service.setBusy(false);
        expect(service.isBusy).toBe(false);
    });
});
