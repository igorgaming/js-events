import { wrap, isEmpty } from "./utils/utils";

/** Класс, обозначающий объект, к которому можно выполнить биндинг на события(`on()`, `one()`, `off()`).
 *
 * @example
 * class YourClass {
 *     //#region Bindable
 *
 *     // Объявляем ивенты, на которые можно привязать только один обработчик.
 *     // Последующие разы будут перезаписывать существующую привязку.
 *     get singleEvents() {
 *         return [
 *             'show',
 *             'close',
 *         ];
 *     }
 *
 *     // Объявляем ивенты, на которые можно привязать сколько угодно обработчиков.
 *     get massEvents() {
 *         return [
 *             'showed',
 *             'closed',
 *         ];
 *     }
 *
 *     // Это свойство должно идти после _singleEvents и _massEvents, либо значение ему должно устанавливаться в конструкторе.
 *     _bindableObject = new BindableObject(this.singleEvents, this.massEvents);
 *
 *     // Так же мы должны вручную определить методы и их аргументы, которые будут
 *     // доступны для использования(.on(), .one(), .off()). Обратите внимание на return.
 *
 *     on(events, callback, canUnbind) {
 *         this._bindable.on(events, callback, canUnbind);
 *
 *         return this;
 *     }
 *
 *     one(events, callback, canUnbind) {
 *         this._bindable.one(events, callback, canUnbind);
 *
 *         return this;
 *     }
 *
 *     off(event, callback) {
 *         this._bindable.off(event, callback);
 *
 *         return this;
 *     }
 *
 *     //#endregion
 *
 *     method() {
 *         // Здесь мы используем не this.has, а this._bindable._HasCallback
 *         // Так же вручную передаём this в call(), чтобы внутри обработчика this ссылался на наш класс,
 *         // а не на BindableObject.
 *         if (this._bindable.has('showed')) {
 *             let result = this._bindable.call('showed', [], this)[0];
 *
 *             // ...
 *         } else {...}
 *     }
 * }
 *
 * // Наследование.
 * class YourClass2 extends YourClass {
 *     // Добавляем 'newEvent' к существующим ивентам для массовой привязки.
 *     get massEvents() {
 *         return [
 *             ...super.massEvents,
 *             'newEvent',
 *         ];
 *     }
 *
 *     constructor() {
 *         // Устанавливаем новые ивенты BindableObject.
 *         // При добавлении новых ивентов в дочерних классах, нам необходимо вызывать этот метод в конструкторе.
 *         // Однако, мы можем использовать геттер get singleEvents() {return [...]}(как в этом примере), вместо обычного
 *         // свойства(и в родителе, и в дочернем). Тогда нам не придётся вызывать данный метод, а всё будет работать сразу же.
 *
 *         // this._bindable.setEvents(this._singleEvents, this._massEvents);
 *     }
 *
 *     method2() {
 *         if (this._bindable.has('newEvent')) {
 *             let result = this._bindable.call('newEvent')[0];
 *
 *             // ...
 *         } else {...}
 *     }
 * }
 */
class BindableObject {
    constructor(singleEvents = null, massEvents = null) {
        this.setEvents(singleEvents ?? [], massEvents ?? []);
    }

    /** An array of events to which only one handler can be bound.
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
    setEvents(singleEvents, massEvents) {
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
        if (!(callback instanceof Function)) {
            throw new Error("Argument 'callback' must be an instance of Function.");
        }

        events = events.split(' ');

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

        return this;
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
        return this.on(events, callback, canUnbind, true);
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
        // Если название функции не указано - очищаем все обработчики событий с заданным callback или без него.
        events = isEmpty(events)
            ? Object.keys(this._bindedEvents)
            : events.split(' ');

        for (const event of events) {
            if (!this.has(event)) {
                continue;
            }

            this._bindedEvents[event].spliceVal(
                el => (callback == null
                    ? el.canUnbind
                    : el.callback == callback),
                true
            );
        }

        return this;
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

module.exports = { BindableObject };

// // #region BindableObjectTest

// /*-------------------------------------------------------------*/
// /*    Первый способ использования: наследование от BindableObject
// /*-------------------------------------------------------------*/

// // class DummyObject extends BindableObject2 {
// //     _singleEvents = [
// //         'close',
// //         'show',
// //     ];
// //     _massEvents = [
// //         'closed',
// //         'showed',
// //     ];

// //     show() {
// //         if (this.call('show', ['first arg in show', 'second arg in show'])[0] == false) return;

// //         this.call('showed');
// //     }

// //     close() {
// //         let bool = this.call('close', [['array of', 'values', 'as first arg'], ['array of', 'values', 'as second arg']])[0];
// //         if ( == false) return;

// //         this.call('closed');
// //     }
// // }

// // class DummyObject2 extends DummyObject {
// //     _singleEvents = [
// //         ...this._singleEvents,
// //         'test'
// //     ];

// //     fireTest() {
// //         this.call('test');
// //     }
// // }

// /*-------------------------------------------------------------*/
// /*    Второй способ испольования: композиция(свойство в классе) + static
// /*-------------------------------------------------------------*/

// class DummyObject {
//     _singleEvents = [
//         'close',
//         'show',
//     ];

//     _massEvents = [
//         'closed',
//         'showed',
//     ];

//     _bindable = new BindableObject2(this._singleEvents, this._massEvents);

//     show() {
//         if (this._bindable.call('show', ['first arg in show', 'second arg in show'])[0] == false) return;

//         this._bindable.call('showed');
//     }

//     close() {
//         if (this._bindable.call('close', [['array of', 'values', 'as first arg'], ['array of', 'values', 'as second arg']])[0] == false) return;

//         this._bindable.call('closed');
//     }

//     on(funcNames, callback, canUnbind = true) {
//         this._bindable.on(funcNames, callback, canUnbind);
//         return this;
//     }

//     off(funcNames, callback = null) {
//         this._bindable.off(funcNames, callback);
//         return this;
//     }

//     one(funcNames, callback, canUnbind = true) {
//         this._bindable.one(funcNames, callback, canUnbind);
//         return this;
//     }
// }

// class DummyObject2 extends DummyObject {
//     _singleEvents = [
//         ...this._singleEvents,
//         'test'
//     ];

//     _bindable = new BindableObject2(this._singleEvents, this._massEvents);

//     fireTest() {
//         this._bindable.call('test');
//     }
// }

// class DummyStatic {
//     static _singleEvents = [
//         'test',
//     ];

//     static _massEvents = [];

//     static _bo = new BindableObject2(this._singleEvents, this._massEvents);

//     static on(events, callback, canUnbind = true) {
//         this._bo.on(events, callback, canUnbind);
//     }

//     static method() {
//         this._bo.call('test');
//     }
// }

// class DummyStatic2 extends DummyStatic {
//     static _singleEvents = [
//         ...this._singleEvents,
//         'test2',
//     ];

//     static _bo = new BindableObject2(this._singleEvents, this._massEvents);

//     static method2() {
//         this._bo.call('test2');
//     }
// }

// // Fast static tests
// DummyStatic.on('test test2', () => console.log('Static test #1'));
// DummyStatic.method();

// DummyStatic2.on('test test2', () => console.log('Static test #2'));
// DummyStatic2.method();
// DummyStatic2.method2();

// console.log('Должен вывести Static test #1 и #2 2 раза.');
// console.log('-----------------------------');

// // Init
// let s = new DummyObject();
// let s2 = new DummyObject2();

// // Несуществующие ивенты
// s.on('test', () => {throw new Error("Error!");});
// s.off('test', () => { });

// s.show();
// s.close();
// console.log('Ничего не должен был вывести.');
// console.log('-----------------------------');

// // Бинд на massEvents
// s = new DummyObject();
// s.on('closed', function() {
//     console.log('closed 1');
// }).on('closed', function() {
//     console.log('closed 2');
// });
// s.on("showed", function() {
//     console.log('showed 1');
// }).on('showed', function() {
//     console.log('showed 3');
// }).on('showed', function() {
//     console.log('showed 2');
// });

// s.show();
// s.close();

// console.log('Должен вывести showed 1-3, closed 1-2.');
// console.log('-----------------------------');

// // Бинд на singleEvents + передача значения и получение возвращаемого
// s = new DummyObject();
// s.on('closed', () => console.log('closed'));
// s.on('showed', () => console.log('showed'));
// s.on('close', (e) => {console.log(e); return true;});
// s.on('show', () => true);
// s.on('show', (e1, e2) => {console.log(e1, e2); return false;});
// s.on('close', () => true);

// s.show();
// s.close();

// console.log('Должен вывести только "first arg in show", "second arg in show", "closed".');
// console.log('-----------------------------');

// // Отмена бинда
// s = new DummyObject();
// s.on("showed", function() {
//     console.log('showed 1');
// }).on('showed', function() {
//     console.log('showed 3');
// }).on('showed', function() {
//     console.log('showed 2');
// }).off('showed');

// s.show();
// s.close();

// console.log('Ничего не выводит.');
// console.log('-----------------------------');

// s = new DummyObject();
// let sFunc = function() {
//     console.log('showed x or closed x');
// };
// s.on("showed", sFunc)
//     .on('showed', sFunc)
//     .on('showed', function() {
//         console.log('showed 1');
//     })
//     .on('closed', sFunc)
//     .off(null, sFunc);

// s.show();
// s.close();

// console.log('Выводит showed 1.');
// console.log('-----------------------------');

// s = new DummyObject();
// s.on("showed", sFunc)
//     .on('showed', sFunc)
//     .on('showed', function() {
//         console.log('showed 1');
//     })
//     .on('closed', sFunc)
//     .off('showed', sFunc);

// s.show();
// s.close();

// console.log('Выводит showed 1, showed x or closed x.');
// console.log('-----------------------------');

// // Одноразовый бинд
// s = new DummyObject();
// s.one('showed closed test', function() {
//     console.log('showed or closed');
// }, false); //если поставить true, вообще не должен ничего выводить

// s.off('showed closed');

// s.show();
// s.close();

// s.show();
// s.close();

// console.log('Выводит showed or closed 2 раза.');
// console.log('-----------------------------');

// let f = function() {
//     console.log('showed or closed');
// };
// s.one('showed closed', f, false);
// s.off('showed', f);

// s.show();
// s.close();

// s.show();
// s.close();

// console.log('Выводит showed or closed.');
// console.log('-----------------------------');

// s2 = new DummyObject2();
// s2.on('test', () => {
//     console.log('test');
// }).on('showed', () => {
//     console.log('showed');
// });
// s2.fireTest();
// s2.show();

// console.log('Выводит test и showed.');
// console.log('-----------------------------');

// //#endregion
