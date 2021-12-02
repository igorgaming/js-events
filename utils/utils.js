/** Wraps the given value in an array.
 * @param {any} value Value to wrap.
 * @returns {array}
 */
export function wrap(value) {
    return Array.isArray(value) ? value : [value];
}

export function isEmpty(value) {
    return value == null || value == "";
}
