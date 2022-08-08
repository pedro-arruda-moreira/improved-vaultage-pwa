function isAllowedTag(el: Element) {
    if (!el.tagName) {
        return false;
    }
    var tagName = el.tagName.toLowerCase();
    return tagName == 'input' || tagName == 'textarea';
}

export function start() {
    // disable text selection
    window.document.addEventListener('selectstart', function (e) {

        const target = e.target;
        if (!target) {
            return;
        }
        const elem = target as Element;
        if (!isAllowedTag(elem)) {
            e.preventDefault();
            return false;
        }
    });
}