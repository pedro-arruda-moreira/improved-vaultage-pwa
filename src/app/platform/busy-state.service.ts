import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from "@angular/core";

@Injectable()
export class BusyStateService {

    private busy = false;

    public get isBusy(): boolean {
        return this.busy;
    }

    public setBusy(busy: boolean): void {
        this.busy = busy;
    }
}
