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
