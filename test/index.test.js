var assert = require('assert');
const { default: BindableObject } = require('..');

describe('BindableObject', function() {
    describe('setEvents', function() {
        it('should successfully set events', function() {
            const obj = new BindableObject();
            obj.setEvents(['foo', 'bar'], ['foo', 'bar']);

            assert.deepEqual(['foo', 'bar'], obj._singleEvents);
            assert.deepEqual(['foo', 'bar'], obj._massEvents);
        });
    });

    describe('on | one', function() {
        it('shouldnt bind to not specified events', function() {
            const obj = new BindableObject();
            obj.on('test', () => 1);

            assert.equal(false, obj.has('test'));
        })

        it('should return empty array if there is no handlers', function() {
            const obj = new BindableObject();

            const result = obj.call('some-event');

            assert.deepEqual([], result);
        });

        it('should return correct results for single events', function() {
            const obj = new BindableObject(['singleTest', 'singleTest2'], ['massTest', 'massTest2']);

            obj.on('singleTest singleTest2', () => 1);
            obj.on('singleTest singleTest2', () => 2);

            const result = obj.call('singleTest');
            const result2 = obj.call('singleTest2');

            assert.deepEqual([2], result);
            assert.deepEqual([2], result2);
        });

        it('should return correct results for mass events', function() {
            const obj = new BindableObject(['singleTest', 'singleTest2'], ['massTest', 'massTest2']);

            obj.on('massTest massTest2', () => 1);
            obj.on('massTest massTest2', () => 2);
            obj.on('massTest2', () => 3);

            const result = obj.call('massTest');
            const result2 = obj.call('massTest2');

            assert.deepEqual([1, 2], result);
            assert.deepEqual([1, 2, 3], result2);
        });

        it('can unbind if "canUnbind" argument is true', function() {
            const obj = new BindableObject(['singleTest'], ['massTest']);

            obj.on('singleTest', () => 1, true);
            obj.on('massTest', () => 2, true);

            assert.equal(true, obj.has('singleTest'));
            assert.equal(true, obj.has('massTest'));

            obj.off('singleTest massTest');

            assert.equal(false, obj.has('singleTest'));
            assert.equal(false, obj.has('massTest'));
        });

        it('cant unbind if "canUnbind" argument is false', function() {
            const obj = new BindableObject(['singleTest'], ['massTest']);

            obj.on('singleTest', () => 1, false);
            obj.on('massTest', () => 2, false);

            assert.equal(true, obj.has('singleTest'));
            assert.equal(true, obj.has('massTest'));

            obj.off('singleTest massTest');

            assert.equal(true, obj.has('singleTest'));
            assert.equal(true, obj.has('massTest'));
        });

        it('shouldnt unbind after first call if "unbindAfterCall" argument is false', function() {
            const obj = new BindableObject(['singleTest'], ['massTest']);

            obj.on('singleTest', () => 1, false, false);
            obj.on('massTest', () => 2, false, false);

            assert.equal(true, obj.has('singleTest'));
            assert.equal(true, obj.has('massTest'));

            obj.call('singleTest');
            obj.call('massTest');

            assert.equal(true, obj.has('singleTest'));
            assert.equal(true, obj.has('massTest'));
        });

        it('should unbind after first call if "unbindAfterCall" argument is true', function() {
            const obj = new BindableObject(['singleTest'], ['massTest']);

            obj.one('singleTest', () => 1);
            obj.one('massTest', () => 2);

            assert.equal(true, obj.has('singleTest'));
            assert.equal(true, obj.has('massTest'));

            obj.call('singleTest');
            obj.call('massTest');

            assert.equal(false, obj.has('singleTest'));
            assert.equal(false, obj.has('massTest'));
        });

        it('should unbind after first call if "unbindAfterCall" argument is true and "canUnbind" is false', function() {
            const obj = new BindableObject(['singleTest'], ['massTest']);

            obj.one('singleTest', () => 1, false);
            obj.one('massTest', () => 2, false);

            assert.equal(true, obj.has('singleTest'));
            assert.equal(true, obj.has('massTest'));

            obj.call('singleTest');
            obj.call('massTest');

            assert.equal(false, obj.has('singleTest'));
            assert.equal(false, obj.has('massTest'));
        });
    });

    describe('off', function() {
        it('can unbind from specific events a specific handler', function() {
            const obj = new BindableObject(['singleTest', 'singleTest2'], ['massTest', 'massTest2']);
            const handler = () => 1;

            obj.on('massTest', handler);
            obj.on('massTest2', () => 2);
            obj.on('massTest2', () => 3);
            obj.on('singleTest', handler);
            obj.on('singleTest2', () => 3);

            obj.off('massTest massTest2 singleTest singleTest2');

            assert.equal(false, obj.has('massTest'));
            assert.equal(false, obj.has('massTest2'));
            assert.equal(false, obj.has('singleTest'));
            assert.equal(false, obj.has('singleTest2'));
        });

        it('can unbind from specific events all handlers', function() {
            const obj = new BindableObject(['singleTest'], ['massTest']);

            obj.on('massTest', () => 1);
            obj.on('massTest', () => 2);
            obj.on('singleTest', () => 3);

            assert.equal(true, obj.has('massTest'));
            assert.equal(true, obj.has('singleTest'));

            obj.off(['massTest', 'singleTest']);

            assert.equal(false, obj.has('massTest'));
            assert.equal(false, obj.has('singleTest'));
        });

        it('can unbind from any events a specific handler', function() {
            const obj = new BindableObject(['singleTest', 'singleTest2'], ['massTest']);
            const handler = () => 1;

            obj.on('massTest', handler);
            obj.on('massTest', handler);
            obj.on('singleTest', handler);
            obj.on('singleTest2', () => 2);

            assert.equal(true, obj.has('massTest'));
            assert.equal(true, obj.has('singleTest'));
            assert.equal(true, obj.has('singleTest2'));

            obj.off(null, handler);

            assert.equal(false, obj.has('massTest'));
            assert.equal(false, obj.has('singleTest'));
            assert.equal(true, obj.has('singleTest2'));
        });

        it('can unbind from any events all handlers', function() {
            const obj = new BindableObject(['singleTest', 'singleTest2'], ['massTest']);
            const handler = () => 1;

            obj.on('massTest', handler);
            obj.on('massTest', () => 2);
            obj.on('singleTest', handler);
            obj.on('singleTest2', () => 3);

            obj.off();

            assert.equal(false, obj.has('massTest'));
            assert.equal(false, obj.has('singleTest'));
            assert.equal(false, obj.has('singleTest2'));
        });
    })

    describe('has', function() {
        it('should return true if event has any handlers', function() {
            const obj = new BindableObject(['singleTest', 'singleTest2'], ['massTest', 'massTest2']);

            obj.on('singleTest massTest', () => 1);

            assert.equal(true, obj.has('singleTest'));
            assert.equal(true, obj.has('massTest'));
        });

        it('should return false if event hasnt any handlers', function() {
            const obj = new BindableObject(['singleTest', 'singleTest2'], ['massTest', 'massTest2']);

            obj.on('singleTest massTest', () => 1);

            assert.equal(false, obj.has('singleTest2'));
            assert.equal(false, obj.has('massTest2'));
        });

        it('should return false if event doesnt exists', function() {
            const obj = new BindableObject();

            assert.equal(false, obj.has('some-event'));
            assert.equal(false, obj.has('some-event'));
        });
    });

    describe('call', function() {
        it('should call and return results from handlers', function() {
            const obj = new BindableObject(['singleTest'], ['massTest']);

            obj.on('massTest singleTest', () => 1);
            obj.on('massTest singleTest', () => 2);
            obj.on('massTest', () => 3);

            const result = obj.call('singleTest');
            const result2 = obj.call('massTest');

            assert.deepEqual([2], result);
            assert.deepEqual([1, 2, 3], result2);
        });

        it('should call and return results from handlers with args', function() {
            const obj = new BindableObject(['singleTest', 'singleTest2'], ['massTest']);

            obj.on('massTest singleTest', (arg1, arg2) => arg1 + arg2);
            obj.on('massTest singleTest', (arg1, arg2) => arg1 - arg2);
            obj.on('singleTest2', (arg) => arg);

            const result = obj.call('singleTest', [2, 1]);
            const result2 = obj.call('massTest', [2, 3]);
            const result3 = obj.call('singleTest2', [[5, 10, 15]]);

            assert.deepEqual([1], result);
            assert.deepEqual([5, -1], result2);
            assert.deepEqual([[5, 10, 15]], result3);
        });

        it('should call and return results from handlers with thisArg', function() {
            const _this = Array;
            const obj = new BindableObject(['singleTest'], ['massTest']);

            obj.on('massTest singleTest', function() {
                return this;
            });
            obj.on('massTest', function() {
                return `ThisArg is: ${this}`;
            });

            const result = obj.call('singleTest', [], _this);
            const result2 = obj.call('massTest', [], _this);

            assert.deepEqual([_this], result);
            assert.deepEqual([_this, `ThisArg is: ${_this}`], result2);
        });
    })
});
