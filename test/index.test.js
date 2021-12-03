var assert = require('assert');
const { default: BindableObject } = require('..');

describe('BindableObject', function() {
    describe('setEvents', function() {
        it('should successfully set events', function() {
            const obj = new BindableObject();
            obj.setEvents(['singleTest', 'singleTest2'], ['massTest', 'massTest2']);

            assert.deepEqual(['singleTest', 'singleTest2'], obj._singleEvents);
            assert.deepEqual(['massTest', 'massTest2'], obj._massEvents);
        });
    });
});
