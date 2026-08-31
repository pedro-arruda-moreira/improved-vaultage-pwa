import { instance, Mock, mock as omnimockMock, verify } from "omnimock";
import { MockProvider, MockReset, Type as NgMocksType } from "ng-mocks";
import { InjectionToken, Type, ValueProvider } from "@angular/core";
import { ConstructorType } from "omnimock/dist/base-types";

/*
 * pedro-arruda-moreira: support for custom attributes
 * on test event.
 */
export function createNewEvent(eventName: string, bubbles = false, cancelable = false, customAttributes?: any) {
    const evt = document.createEvent('CustomEvent');
    if (customAttributes) {
        for (const attr in customAttributes) {
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

export function omnimockToNgMock<T>(omnimock: Mock<T>, type: NgMocksType<T> | InjectionToken<T>): ValueProvider {
    return MockProvider(
        type,
        instance(omnimock) as Partial<T>,
        'useValue'
    );
}

let createdMocks: Record<string, Mock<any>> = {};

export function cleanup() {
    MockReset();
    createdMocks = {};
}


export function mock<T>(id: InjectionToken<T> | string, type: ConstructorType<T>): Mock<T> {
    const name = typeof id === 'string' ? id : id.toString();
    if (createdMocks[name]) {
        return createdMocks[name] as Mock<T>;
    }
    const newMock = omnimockMock<T>(type, {
        reference: undefined,
        __anonymousType: undefined,
        overriddenName: undefined,
        name: undefined,
        toString: () => name,
        ngOnDestroy: () => undefined
    } as unknown as Partial<T>);
    createdMocks[name] = newMock;
    return newMock;
}

export function verifyAllMocks() {
    expect(callsAreCorrect).not.toThrow();
}

function callsAreCorrect() {
    for (const name in createdMocks) {
        const mock = createdMocks[name];
        if (mock) {
            verify(mock);
        }
    }
}
