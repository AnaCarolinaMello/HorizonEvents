# window.name

A DOM Storage API compatible storage layer for storing data in the `window.name`
property.

## Installation

This module was designed with browserify in mind and can be installed from the
public npm registry:

```
npm install --save window.name
```

## Usage

In all examples we assume that you've required the module as:

```js
'use strict';

var windowStorage = require('window.name');
```

The API is we expose is compatible with the API of the DOM Storage methods. They
can be found at:

https://developer.mozilla.org/en-US/docs/Web/API/Storage

```js
windowStorage.setItem('foo', 'bar');  // Returns undefined and stores the value.
windowStorage.getItem('bar');         // Not found, returns null.
windowStorage.getItem('foo');         // Returns `bar`.
windowStorage.length;                 // 1
windowStorage.removeItem('foo');      // Returns undefined, length is now 0.
widnowStorage.clear();                // Returns undefined and clears all items.
```

## License

MIT
