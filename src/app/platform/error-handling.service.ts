import { Inject, Injectable } from '@angular/core';
import { WINDOW } from './providers';

@Injectable()
export class ErrorHandlingService {

    constructor(@Inject(WINDOW) private readonly window: Window) { }

    public onError = (e: unknown) => {
        (this.window as any).console.error(e);
    }
}
