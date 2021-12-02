# Js events

Its a small package for easy use of custom events in js.

# Available methods

`constructor(singleEvents = [], massEvents = [])` - Constructor that calls `.setEvents()`.
`setEvents(singleEvents, massEvents)` - Set single and mass events.
`on(events, callback, canUnbind = true, unbindAfterCall = false)` - Bind handler function to one or more events.
`one(events, callback, canUnbind = true)` - Bind handler function to one or more events and remove it after first call.
`off(events = null, callback = null)` - Remove a handler from one or more events.
`has(event)` - Checks whether at least one handler is assigned to the specified event.
`call(event, args = [], thisArg = this)` - Call all handlers for the specific event and get their return values.

# Base usage
```
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
    on(events, callback, canUnbind) {
        this._bindable.on(events, callback, canUnbind);

        return this;
    }
    one(events, callback, canUnbind) {
        this._bindable.one(events, callback, canUnbind);
        return this;
    }
    off(event, callback) {
        this._bindable.off(event, callback);
        return this;
    }
    //#endregion

    method() {
        // Here we check for handlers for a specific event and, if there are any, call them.
        // We can also pass arg `thisArg` so that the handler references our class and not `BindableObject`.
        if (this._bindable.has('showed')) {
            let result = this._bindable.call('showed', [], this)[0];  // get result only from first handler
            // ...
        } else {...}
    }
}
```

# Extending classes with events

```
class YourClass2 extends YourClass {
    // Добавляем 'newEvent' к существующим ивентам для массовой привязки.
    // Adding event 'newEvent' to existing events.
    _massEvents = [
        ...super.massEvents,  // we save all the events that are present in the `YourClass`
        'newEvent',
    ];

    constructor() {
        super();

        // Setting new `BindableObject` events.
        // When adding new events in child classes, we need to call this method in the constructor.
        // However, we can use the getters instead of the usual properties (in both parent and child).
        // Then we won't have to call this method, and everything will work right away.

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
As you could see in the example above, we need to call `.setEvents()` every time we expand the list of events when extends the parent class.
This is not very convenient, however, this is how classes work in javascript.
We can get around this by using getters.
This will avoid calling `.setEvents()` every time when extending parent class.

```
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
class SomeClass {
    // setup events, etc.
    ...

    handler = function(arg) {
        console.log(arg);
    }

    method() {
        this.on('test', handler, false);
    }

    method2() {
        this.off('test', handler);
    }
}

const instance = new SomeClass();
instance.method();  // callbacks: 1
instance.off();     // callbacks: still 1
instance.method2(); // callbacks: 0
```
