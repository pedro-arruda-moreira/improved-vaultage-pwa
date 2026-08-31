import { instance, Mock, mock as omnimockMock } from "omnimock";
import { AnyType, MockProvider, Type } from "ng-mocks";
import { ValueProvider } from "@angular/core";

/*
 * pedro-arruda-moreira: support for custom attributes
 * on test event.
 */
export function createNewEvent(eventName: string, bubbles = false, cancelable = false, customAttributes?: any) {
    const evt = document.createEvent('CustomEvent');
    if(customAttributes) {
        for(const attr in customAttributes) {
            ((evt as any)[attr] = customAttributes[attr])
        }
    }
    evt.initCustomEvent(eventName, bubbles, cancelable, null);
    return evt;
}

export function typeValue(input: HTMLInputElement, value: string) {
    input.value = value;
    input.dispatchEvent(createNewEvent('input'));
}


interface NgMockCompat {
    ngMetadataName: any;
    ngOnDestroy(): void;
}

export function omnimockToNgMock<T>(omnimock: Mock<T>, type: Type<T>): ValueProvider {
    return MockProvider(
        type,
        instance(omnimock),
        'useValue'
    );
}

export function mock<T>(name: string): Mock<T> {
    return omnimockMock<NgMockCompat & T>(name, {
        ngMetadataName: undefined,
        ngOnDestroy: () => {}
    } as Partial<NgMockCompat & T>);
}

