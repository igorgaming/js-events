export function wrap(value) {
    return Array.isArray(value) ? value : [value];
}

export function splitString(value) {
    if (typeof(value) === 'string') {
        return value.split(' ');
    }

    return value;
}

export function isEmpty(value) {
    return value == null || value == '';
}
