# Js events

Small package for easy use of custom events in js.

# Installation

Run `npm i js-events-dispatcher` and use `import BindableObject from 'js-events-dispatcher'`.

# Documentation

All available methods has JSDoc block even with `@example`.

Available methods listed below.

# Available methods

- `constructor(singleEvents = [], massEvents = [])` - Constructor that calls `.setEvents()`.
- `setEvents(singleEvents, massEvents)` - Set single and mass events.
- `on(events, callback, canUnbind = true, unbindAfterCall = false)` - Bind handler function to one or more events.
- `one(events, callback, canUnbind = true)` - Bind handler function to one or more events and remove it after first call.
- `off(events = null, callback = null)` - Remove a handler from one or more events.
- `has(event)` - Checks whether at least one handler is bound to the specified event.
- `call(event, args = [], thisArg = this)` - Call all handlers for the specific event and get their return values.

# Browsers support

This package uses preset `@babel/preset-env` of [babel](https://github.com/babel/babel) to transform js code for old browsers.

# Basic usage

There are two types of events:
- single events
- mass events

Single events allow bind to them only one handler, while mass events allow bind multiple handlers.

When you bind a handler to single event second time, first handler will be removed.

When you bind a handler to mass event, first handler will not be removed.
Also, the call of all handlers occurs sequentially relative to when they were bound.

```
import BindableObject from 'js-events-dispatcher';

class YourClass {
    //#region Bindable
    // Init an array of events to which only one handler can be bound.
    // Subsequent times will overwrite the existing binding.
    _singleEvents = [
        'show',
        'close',
    };

    // Init an array of events to which multiple handlers can be bound.
    _massEvents = [
        'showed',
        'closed',
    ];

    // Init BindableObject. This property should be go below previous one, or constructor of this
    // class should call `.setEvents()` method of the `BindableObject` class.
    _bindable = new BindableObject(this._singleEvents, this._massEvents);

    // You should also define the methods below if your class supports the ability to bind from the outside.
    // This is useful if you are developing a package that will contain events that users can bind to.
    on(events, callback, canUnbind = true) {
        this._bindable.on(events, callback, canUnbind);

        return this;
    }
    one(events, callback, canUnbind = true) {
        this._bindable.one(events, callback, canUnbind);

        return this;
    }
    off(event = null, callback = null) {
        this._bindable.off(event, callback);

        return this;
    }
    //#endregion

    method() {
        // Here we check for handlers for a specific event and, if there are any, call them.
        // We can also pass arg `thisArg` so that the handler references our class and not `BindableObject`.
        // Note: If you don't need to know if a handler exists, you don't have to call `.has()`
        if (this._bindable.has('showed')) {
            let result = this._bindable.call('showed', [], this)[0];  // get result only from first handler
            // ...
        } else {...}
    }
}
```

# Extending classes with events

```
import BindableObject from 'js-events-dispatcher';

class YourClass2 extends YourClass {
    // Adding event 'newEvent' to existing events.
    _massEvents = [
        ...super.massEvents,  // we use this to get existing events in parent class and add new events to them
        'newEvent',
    ];

    constructor() {
        super();

        // Setting new `BindableObject` events.
        // When adding new events in child classes, we need to call this method in the constructor.
        // However, we can simplify extending by using getters. Check example below.

        this._bindable.setEvents(this._singleEvents, this._massEvents);
    }

    method2() {
        if (this._bindable.has('newEvent')) {
            let result = this._bindable.call('newEvent')[0];
            // ...
        } else {...}
    }
}
```

# Using getters to simplify extending
As you could see in the example above, we need to call `.setEvents()` in `constructor()` every time we expand the list of events when extends the parent class.
This is not very convenient, however, this is how classes works in javascript.
We can get around this by using getters.
This will avoid calling `.setEvents()` every time when extending parent class.

```
import BindableObject from 'js-events-dispatcher';

class YourClass {
    get singleEvents() {
        return [
            'show',
            'close',
        ];
    }

    get massEvents() {
        return [
            'showed',
            'closed',
        ];
    }

    ...
}

class YourClass2 extends YourClass {
    get singleEvents() {
        return [
            ...super.singleEvents,
            'newEvent',
        ];
    }

    constructor() {
        super();

        // We are using getters, so we dont need anymore call `setEvents()` here.
    }
}
```

# Prevent accidental handler remove

If you are creating a package and allow the users bind to the events of your class and you yourself use the events of your class,
if users using `.off()` without the second argument, your handler, which is necessary for your class to work, may be accidentally removed.
To prevent this, you can pass `false` for the `canUnbind` argument of `on()` method.

Therefore, users will not be able to accidentally remove an important handler for your class,
but you can still do this by passing your handler as the second argument to `off()`.
For example:

```
import BindableObject from 'js-events-dispatcher';

class SomeClass {
    // setup events, etc.
    ...

    handler = function() {
        ...
    }

    method() {
        this._bindable.on('test', handler, false);
    }

    method2() {
        this._bindable.off('test', handler);
    }
}

const instance = new SomeClass();
instance.method();  // callbacks: 1
instance.off();     // callbacks: still 1
instance.method2(); // callbacks: 0
```
