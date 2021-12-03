"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _utils = require("./utils/utils");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var BindableObject = /*#__PURE__*/function () {
  function BindableObject() {
    var singleEvents = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    var massEvents = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    _classCallCheck(this, BindableObject);

    _defineProperty(this, "_singleEvents", []);

    _defineProperty(this, "_massEvents", []);

    _defineProperty(this, "_bindedEvents", {});

    this.setEvents(singleEvents, massEvents);
  }
  /** An array of events to which only one handler can be bound.
   *
   * @example
   * _singleEvents = {
   *     'show',
   *     'close'
   * }
   * this.on('show', callback);
   * this.on('close', callback);
   */


  _createClass(BindableObject, [{
    key: "setEvents",
    value:
    /** Set single and mass events.
     * @param {string[]} singleEvents An array of events to which only one handler can be bound.
     * @param {string[]} massEvents An array of events to which multiple handlers can be bound.
     */
    function setEvents() {
      var singleEvents = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var massEvents = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
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

  }, {
    key: "on",
    value: function on(events, callback) {
      var canUnbind = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var unbindAfterCall = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      events = (0, _utils.splitString)(events);

      var _iterator = _createForOfIteratorHelper(events),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var event = _step.value;

          if (this._massEvents.includes(event)) {
            if (!Array.isArray(this._bindedEvents[event])) {
              this._bindedEvents[event] = [];
            }

            this._bindedEvents[event].push({
              callback: callback,
              canUnbind: canUnbind,
              unbindAfterCall: unbindAfterCall
            });

            continue;
          }

          if (this._singleEvents.includes(event)) {
            this._bindedEvents[event] = [{
              callback: callback,
              canUnbind: canUnbind,
              unbindAfterCall: unbindAfterCall
            }];
            continue;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
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

  }, {
    key: "one",
    value: function one(events, callback) {
      var canUnbind = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
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

  }, {
    key: "off",
    value: function off() {
      var events = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      // If events no specified we just get all existing events.
      events = (0, _utils.isEmpty)(events) ? Object.keys(this._bindedEvents) : (0, _utils.splitString)(events);

      var _iterator2 = _createForOfIteratorHelper(events),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var event = _step2.value;

          if (!this.has(event)) {
            continue;
          }

          for (var i = 0; i < this._bindedEvents[event].length; i++) {
            if (callback == null && this._bindedEvents[event][i].canUnbind || callback != null && this._bindedEvents[event][i].callback == callback) {
              this._bindedEvents[event].splice(i, 1);

              i--;
            }
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
    /** Checks whether at least one handler is assigned to the specified event.
     * @param {string} event Event name.
     *
     * @returns {boolean}
     */

  }, {
    key: "has",
    value: function has(event) {
      return this._bindedEvents[event] != null && this._bindedEvents[event].length > 0;
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

  }, {
    key: "call",
    value: function call(event) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var thisArg = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this;

      if (!this.has(event)) {
        return [];
      }

      args = (0, _utils.wrap)(args);
      var results = [];
      var functions = this._bindedEvents[event];

      var _iterator3 = _createForOfIteratorHelper(functions),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _func$callback;

          var func = _step3.value;
          results.push((_func$callback = func.callback) === null || _func$callback === void 0 ? void 0 : _func$callback.call.apply(_func$callback, [thisArg].concat(_toConsumableArray(args))));

          if (func.unbindAfterCall) {
            this.off(event, func.callback);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      return results;
    }
  }]);

  return BindableObject;
}();

exports["default"] = BindableObject;