## sessionstorage-for-node

looking for a way to use sessionStorage in node.js? here's a damn sessionStorage for node.js

## How to?
get from npm
```bash
$ npm i sessionstorage-for-nodejs
```

## Adding module
```javascript
const sessionStorage = require('sessionstorage-for-node');
```

## Saving Data
```javascript
sessionStorage.setItem('id', 'value');
```

## Get Saved Data
```javascript
console.log('product: ', sessionStorage.getItem('id'));
```

## Removing Saved Data
```javascript
sessionStorage.removeItem('id', 'value');
```

## Remove all saved data
```javascript
sessionStorage.clear();
```
resources: https://www.npmjs.com/package/sessionstorage-for-nodejs
