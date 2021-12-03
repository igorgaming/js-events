import { wrap, splitString, isEmpty } from './utils/utils';

export default class BindableObject {
    constructor(singleEvents = [], massEvents = []) {
        this.setEvents(singleEvents, massEvents);
    }

    /** An array of events to which only one handler can be bound.
     *
     * @example
     * _singleEvents = {
     *     'show',
     *     'close'
     * }
     * this.on('show', callback)
     * this.on('close', callback)
     */
    _singleEvents = [];

    /** An array of events to which multiple handlers can be bound.
     * @example
     * _massEvents = {
     *     'showed',
     *     'closed',
     * }
     * this.on('showed', callback)
     * this.on('closed', callback)
     */
    _massEvents = [];

    /** Info about events and binded handlers.
     * @example
     * _bindedEvents = {
     *     // single event
     *     eventName: [{
     *         callback: ...,
     *         canUnbind: canUnbind,
     *         unbindAfterCall: unbindAfterCall,
     *     }],
     *
     *     // mass event
     *     // The structure is a same as above, but there are more than one handler.
     *     eventName: [
     *         {...},
     *         {...}
     *     ]
     * }
     */
    _bindedEvents = {};

    /** Set single and mass events.
     * @param {string[]} singleEvents An array of events to which only one handler can be bound.
     * @param {string[]} massEvents An array of events to which multiple handlers can be bound.
     */
    setEvents(singleEvents = [], massEvents = []) {
        this._singleEvents = singleEvents;
        this._massEvents = massEvents;
    }

    /** Bind handler function to one or more events.
     * @param {string|string[]} events Event or events names.
     * @param {Function} callback Handler function.
     * @param {boolean} canUnbind Can a handler be removed without its direct indication.
     * @param {boolean} unbindAfterCall Remove a handler after first call.
     *
     * @description Using `this` in a handler function will return instance of the `BindableObject`.
     *
     * @example
     * this.on('close', ...);
     * this.on('close close2', ...);
     * this.on(['close', 'close2'], ...);
     *
     * @example
     * this.on('close', () => {}, true); // callbacks: 1
     * this.off();                       // callbacks: 0
     *
     * let f = () => {};
     * this.on('close', f, false);       // callbacks: 1
     * this.off();                       // callbacks: 1
     * this.off('close', f);             // callbacks: 0
     *
     * @example
     * this.on('close', () => {}, true); // callbacks: 1
     * this.call('close');               // callbacks: 1
     *
     * this.on('close', () => {}, true, true);  // callbacks: 1
     * this.call('close');                      // callbacks: 0
     */
    on(events, callback, canUnbind = true, unbindAfterCall = false) {
        events = splitString(events);

        for (const event of events) {
            if (this._massEvents.includes(event)) {
                if (!Array.isArray(this._bindedEvents[event])) {
                    this._bindedEvents[event] = [];
                }

                this._bindedEvents[event].push({
                    callback: callback,
                    canUnbind: canUnbind,
                    unbindAfterCall: unbindAfterCall,
                });

                continue;
            }

            if (this._singleEvents.includes(event)) {
                this._bindedEvents[event] = [{
                    callback: callback,
                    canUnbind: canUnbind,
                    unbindAfterCall: unbindAfterCall,
                }];

                continue;
            }
        }
    }

    /** Bind handler function to one or more events and remove it after first call.
     * @param {string|string[]} events Event or events names.
     * @param {Function} callback Handler function.
     * @param {boolean} canUnbind Can a handler be removed without its direct indication.
     *
     * @description Its equal to `.on(events, callback, canUnbind, true)`.
     *
     * Using `this` in a handler function will return instance of the `BindableObject`.
     *
     * @example
     * this.one('close', () => {}, true); // callbacks: 1
     * this.call('close');                // callbacks: 0
     */
    one(events, callback, canUnbind = true) {
        this.on(events, callback, canUnbind, true);
    }

    /** Remove a handler from one or more events.
     * @param {string|string[]|null} events Event or events names.
     * @param {Function|null} callback Handler function.
     *
     * @example
     * // Unbind the specific handler from the specific events.
     * this.off(['show', 'close'], f1);
     *
     * // Unbind all handlers from the specific event.
     * this.off('show');
     *
     * // Unbind the specific handler from all events.
     * this.off(null, f1);
     *
     * // Unbind all handlers from all events.
     * this.off();
     */
    off(events = null, callback = null) {
        // If events no specified we just get all existing events.
        events = isEmpty(events)
            ? Object.keys(this._bindedEvents)
            : splitString(events);

        for (const event of events) {
            if (!this.has(event)) {
                continue;
            }

            for(let i = 0; i < this._bindedEvents[event].length; i++) {
                if ((callback == null && this._bindedEvents[event][i].canUnbind)
                    || (callback != null && this._bindedEvents[event][i].callback == callback)) {
                        this._bindedEvents[event].splice(i, 1);
                        i--;
                    }
            }
        }
    }

    /** Checks whether at least one handler is assigned to the specified event.
     * @param {string} event Event name.
     *
     * @returns {boolean}
     */
    has(event) {
        return this._bindedEvents[event] != null
            && this._bindedEvents[event].length > 0;
    }

    /** Call all handlers for the specific event and get their return values.
     * @param {string} event Event name.
     * @param {any|any[]} args Arguments. For an arrays you should use `[['first arg', 'second arg']]`.
     * @param {any} thisArg `this` context for handlers.
     *
     * @returns {any[]} Returns the array of results from each handler.
     *
     * @example
     * this.call('test2', ['test1', 'test2', 'test3', 'test4']);
     * ...
     * this.on('test2', (el1, el2) => console.log(el1, el2));  // output: 'test1', 'test2'
     *
     * @example
     * this.call('test', [['test1', 'test2'], ['test3', 'test4']]);
     * ...
     * this.on('test', (arr1, arr2) => console.log(arr1, arr2));  // output: ['test1', 'test2'], ['test3', 'test4']
     *
     * @example
     * this.on('test', () => 1);
     * this.on('test', () => 2);
     * const results = this.call('test');
     * console.log(results);  // output: [1, 2]
     */
    call(event, args = [], thisArg = this) {
        if (!this.has(event)) {
            return [];
        }

        args = wrap(args);
        const results = [];

        const functions = this._bindedEvents[event];
        for (const func of functions) {
            results.push(func.callback?.call(thisArg, ...args));

            if (func.unbindAfterCall) {
                this.off(event, func.callback);
            }
        }

        return results;
    }
}
