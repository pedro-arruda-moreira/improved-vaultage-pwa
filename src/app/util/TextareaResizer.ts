import { Injectable, Inject } from '@angular/core';
import { WINDOW, LOCAL_STORAGE } from '../platform/providers';

@Injectable({
    providedIn:"any"
})
export class TextareaResizer {
    constructor(
        @Inject(WINDOW) private readonly window: Window,
        @Inject(LOCAL_STORAGE) private readonly localStorage: Storage
    ) {
        this.window.addEventListener('resize', this.doResizeTextareas);
    }

    doResizeTextareas() {
        const allTextareas = this.window.document.querySelectorAll('.textarea-stretch');
        allTextareas.forEach((e) => {
            const elem = e as HTMLTextAreaElement;
            const heightReserveAttr = elem.getAttribute('data-height-reserve');
            if(!heightReserveAttr) {
                return;
            }
            let heightReserve = parseInt(heightReserveAttr);
            if(this.localStorage.getItem('desktop') != 'true') {
                heightReserve += 120;
            }
            let textAreaHeight = this.window.innerHeight - heightReserve;
            if(textAreaHeight < 90) {
                elem.rows = 4;
                elem.style.height = 'auto';
            } else {
                elem.style.height = `${textAreaHeight}px`;
            }
        });
    }
}